/**
 * 가격 예측 유스케이스
 * 
 * 암호화폐의 미래 가격을 예측하는 핵심 비즈니스 로직을 담당합니다.
 * 현재 가격과 기술적 지표를 기반으로 AI를 통해 다양한 시간대의 가격 예측을 수행하고,
 * 지지/저항선과 신뢰도를 제공합니다.
 */
import { Injectable, Inject } from '@nestjs/common';
import { PricePrediction, TimeframePrediction } from '../../domain/entities/price-prediction.entity';
import { TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { BaseResponse, BaseService } from '../../shared/base-response';
import Logger from '../../shared/logger';
import axios from 'axios';

/**
 * 가격 예측 요청 데이터
 */
export interface PredictPriceRequest {
  symbol: string;           // 예측할 암호화폐 심볼
  timeframes?: string[];    // 예측할 시간대들 (기본값: 모든 시간대)
  forceRefresh?: boolean;   // 강제 새로고침 여부 (기본값: false)
}

/**
 * 가격 예측 응답 데이터
 */
export interface PredictPriceResponse {
  symbol: string;                    // 암호화폐 심볼
  currentPrice: string;              // 현재 가격
  predictions: TimeframePrediction[]; // 시간대별 예측
  supportLevels: string[];           // 지지선들
  resistanceLevels: string[];        // 저항선들
  confidence: number;                // 전체 예측 신뢰도
  analysis: {
    marketSentiment: 'bullish' | 'bearish' | 'neutral';
    keyFactors: string[];
    riskFactors: string[];
    recommendation: string;
    disclaimer: string;
  };
  age?: number;                      // 예측 데이터 나이 (밀리초)
}

/**
 * 가격 예측 유스케이스
 * 
 * 의존성 주입을 통해 AI 서비스와 외부 API에 접근하며,
 * 캐시 전략과 AI 예측 메커니즘을 구현합니다.
 */
@Injectable()
export class PredictPriceUseCase extends BaseService {
  // 예측 데이터 유효 기간 (1시간) - 예측은 기술적 분석보다 더 오래 유효
  private readonly PREDICTION_VALIDITY_DURATION = 60 * 60 * 1000;
  
  // 경고 임계값 (50분) - 이 시간이 지나면 백그라운드에서 예측을 갱신
  private readonly WARNING_THRESHOLD = 50 * 60 * 1000;

  // 기본 예측 시간대들
  private readonly DEFAULT_TIMEFRAMES = ['1h', '4h', '24h', '1w', '1m', '3m'];

  constructor(
    @Inject('AiRepository')
    private readonly aiRepository: AiRepository,
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository
  ) {
    super();
  }

  /**
   * 가격 예측 실행
   * 
   * 1. 강제 새로고침이 아닌 경우 캐시에서 먼저 조회
   * 2. 캐시에 유효한 예측이 있으면 반환
   * 3. 예측이 곧 만료될 예정이면 백그라운드에서 갱신
   * 4. 캐시에 없거나 만료된 경우 AI 예측 수행
   * 5. AI 예측 결과를 캐시에 저장 후 반환
   */
  async execute(request: PredictPriceRequest): Promise<BaseResponse<PredictPriceResponse>> {
    try {
      const { symbol, timeframes = this.DEFAULT_TIMEFRAMES, forceRefresh = false } = request;
      const upperSymbol = symbol.toUpperCase();

      // 강제 새로고침이 아닌 경우 캐시에서 먼저 조회
      if (!forceRefresh) {
        const cachedPrediction = await this.getCachedPrediction(upperSymbol);
        
        // 캐시에 유효한 예측이 있는 경우
        if (cachedPrediction && !cachedPrediction.isExpired(this.PREDICTION_VALIDITY_DURATION)) {
          const age = cachedPrediction.getAge();
          
          // 예측이 곧 만료될 예정이면 백그라운드에서 갱신
          if (cachedPrediction.isGettingOld(this.WARNING_THRESHOLD)) {
            this.refreshPredictionInBackground(upperSymbol, timeframes);
          }

          return this.success({
            symbol: cachedPrediction.symbol,
            currentPrice: cachedPrediction.currentPrice,
            predictions: cachedPrediction.predictions,
            supportLevels: cachedPrediction.supportLevels,
            resistanceLevels: cachedPrediction.resistanceLevels,
            confidence: cachedPrediction.confidence,
            analysis: cachedPrediction.analysis,
            age
          }, `캐시에서 ${upperSymbol} 가격 예측 조회 완료`);
        }
      }

      // 캐시에 없거나 만료된 경우, 또는 강제 새로고침인 경우 AI 예측 수행
      Logger.info(`${upperSymbol} 가격 예측을 AI로 수행 중...`);
      const prediction = await this.performPricePrediction(upperSymbol, timeframes);
      
      // AI 예측 결과를 캐시에 저장 (다음 요청을 위해)
      await this.cachePrediction(prediction);

      return this.success({
        symbol: prediction.symbol,
        currentPrice: prediction.currentPrice,
        predictions: prediction.predictions,
        supportLevels: prediction.supportLevels,
        resistanceLevels: prediction.resistanceLevels,
        confidence: prediction.confidence,
        analysis: prediction.analysis
      }, `AI에서 ${upperSymbol} 가격 예측 완료`);

    } catch (error) {
      Logger.error(`가격 예측 중 오류: ${error.message}`);
      return this.fail(`${request.symbol} 가격 예측 실패`);
    }
  }

  /**
   * AI를 통한 가격 예측 수행
   * 
   * @param symbol 암호화폐 심볼
   * @param timeframes 예측할 시간대들
   * @returns PricePrediction 도메인 엔티티
   */
  private async performPricePrediction(symbol: string, timeframes: string[]): Promise<PricePrediction> {
    try {
      // 1. 바이낸스 API에서 지원하는 심볼로 변환
      const binanceSymbol = this.convertToBinanceSymbol(symbol);
      
      // 2. 현재 가격 조회
      const currentPrice = await this.binanceRepository.getCurrentPrice(binanceSymbol);
      
      // 3. KRW 페어인 경우 USDT 가격을 원화로 변환
      const convertedPrice = await this.convertPriceToKRW(symbol, currentPrice.price);
      
      // 4. 기술적 지표 데이터 준비 (실제로는 더 복잡한 데이터 수집이 필요)
      const technicalData: TechnicalData = await this.prepareTechnicalData(binanceSymbol);
      
      // 5. AI 예측 수행 (원래 심볼명으로, 변환된 가격 사용)
      const prediction = await this.aiRepository.predictPrice(
        symbol, // 원래 심볼명 사용
        convertedPrice,
        technicalData
      );

      return prediction;
    } catch (error) {
      Logger.error(`AI 예측 수행 실패: ${error.message}`);
      throw new Error(`가격 예측 수행 실패: ${error.message}`);
    }
  }

  /**
   * 바이낸스 API에서 지원하는 심볼로 변환
   * 
   * @param symbol 원본 심볼
   * @returns 바이낸스 API에서 지원하는 심볼
   */
  private convertToBinanceSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    
    // KRW 페어를 USDT 페어로 변환
    if (upperSymbol.endsWith('KRW')) {
      const baseSymbol = upperSymbol.replace('KRW', '');
      return `${baseSymbol}USDT`;
    }
    
    // 이미 USDT 페어이거나 다른 페어인 경우 그대로 반환
    return upperSymbol;
  }

  /**
   * USDT 가격을 원화로 변환
   * 
   * @param symbol 원본 심볼
   * @param usdtPrice USDT 가격
   * @returns 원화 가격
   */
  private async convertPriceToKRW(symbol: string, usdtPrice: string): Promise<string> {
    const upperSymbol = symbol.toUpperCase();
    
    // KRW 페어인 경우에만 변환
    if (upperSymbol.endsWith('KRW')) {
      try {
        // 실시간 USD/KRW 환율 가져오기
        const usdToKRWRate = await this.getRealTimeExchangeRate();
        
        const usdtPriceNum = parseFloat(usdtPrice);
        const krwPrice = usdtPriceNum * usdToKRWRate;
        
        // 소수점 4자리까지 반올림
        return krwPrice.toFixed(4);
      } catch (error) {
        // 환율 API 실패 시 기본 환율 사용 (2025년 8월 기준)
        Logger.warn('실시간 환율 조회 실패, 기본 환율 사용');
        const defaultUsdToKRWRate = 1350; // 2025년 8월 기준 대략적인 환율
        const usdtPriceNum = parseFloat(usdtPrice);
        const krwPrice = usdtPriceNum * defaultUsdToKRWRate;
        return krwPrice.toFixed(4);
      }
    }
    
    // KRW 페어가 아닌 경우 원래 가격 반환
    return usdtPrice;
  }

  /**
   * 실시간 USD/KRW 환율 조회
   * 
   * @returns USD/KRW 환율
   */
  private async getRealTimeExchangeRate(): Promise<number> {
    try {
      // ExchangeRate-API 사용 (무료 플랜, 더 안정적)
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000, // 5초 타임아웃
        headers: {
          'User-Agent': 'Crypto-Tracker-Pro/1.0'
        }
      });
      const data = response.data;
      
      if (data.rates && data.rates.KRW) {
        const rate = data.rates.KRW;
        Logger.info(`실시간 환율 조회 성공: 1 USD = ${rate} KRW`);
        return rate;
      }
      
      throw new Error('환율 데이터를 찾을 수 없습니다.');
    } catch (error) {
      Logger.error(`환율 API 호출 실패: ${error.message}`);
      
      // 대체 API 시도 (CurrencyAPI)
      try {
        const response = await axios.get('https://api.currencyapi.com/v3/latest?apikey=free&currencies=KRW&base_currency=USD', {
          timeout: 5000
        });
        const data = response.data;
        
        if (data.data && data.data.KRW && data.data.KRW.value) {
          const rate = data.data.KRW.value;
          Logger.info(`대체 API 환율 조회 성공: 1 USD = ${rate} KRW`);
          return rate;
        }
      } catch (secondError) {
        Logger.error(`대체 환율 API도 실패: ${secondError.message}`);
      }
      
      // 세 번째 대체 API 시도 (Open Exchange Rates)
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD', {
          timeout: 5000
        });
        const data = response.data;
        
        if (data.rates && data.rates.KRW) {
          const rate = data.rates.KRW;
          Logger.info(`세 번째 API 환율 조회 성공: 1 USD = ${rate} KRW`);
          return rate;
        }
      } catch (thirdError) {
        Logger.error(`세 번째 환율 API도 실패: ${thirdError.message}`);
      }
      
      throw error;
    }
  }

  /**
   * 기술적 지표 데이터 준비
   * 
   * @param symbol 암호화폐 심볼
   * @returns TechnicalData
   */
  private async prepareTechnicalData(symbol: string): Promise<TechnicalData> {
    // 실제 구현에서는 바이낸스 API에서 더 많은 기술적 지표를 가져와야 함
    // 현재는 기본값으로 설정
    return {
      rsi: 50, // 실제 RSI 계산 필요
      macd: 0, // 실제 MACD 계산 필요
      macdSignal: 0, // 실제 MACD 시그널 계산 필요
      bollingerUpper: '45000', // 실제 볼린저 밴드 계산 필요
      bollingerLower: '43000', // 실제 볼린저 밴드 계산 필요
      ma20: '44000', // 실제 20일 이동평균 계산 필요
      ma50: '43500', // 실제 50일 이동평균 계산 필요
      volume: '1000000', // 실제 거래량 데이터 필요
      volumeChange: '5.2' // 실제 거래량 변화율 계산 필요
    };
  }

  /**
   * 캐시에서 예측 데이터 조회
   * 
   * @param symbol 암호화폐 심볼
   * @returns 캐시된 예측 또는 null
   */
  private async getCachedPrediction(symbol: string): Promise<PricePrediction | null> {
    // 실제 구현에서는 메모리 캐시나 Redis에서 조회
    // 현재는 null 반환 (캐시 미구현)
    return null;
  }

  /**
   * 예측 데이터를 캐시에 저장
   * 
   * @param prediction 예측 데이터
   */
  private async cachePrediction(prediction: PricePrediction): Promise<void> {
    // 실제 구현에서는 메모리 캐시나 Redis에 저장
    // 현재는 로그만 출력
    Logger.info(`예측 캐시 저장: ${prediction.symbol}`);
  }

  /**
   * 백그라운드에서 예측 데이터 갱신
   * 
   * 사용자 응답을 차단하지 않고 비동기적으로 최신 예측을 수행하여
   * 캐시를 업데이트합니다. 실패해도 사용자에게는 영향을 주지 않습니다.
   */
  private async refreshPredictionInBackground(symbol: string, timeframes: string[]): Promise<void> {
    try {
      const prediction = await this.performPricePrediction(symbol, timeframes);
      await this.cachePrediction(prediction);
      Logger.info(`${symbol} 백그라운드 예측 갱신 완료`);
    } catch (error) {
      // 백그라운드 갱신 실패는 사용자에게 영향을 주지 않으므로 로그만 남김
      Logger.error(`${symbol} 백그라운드 예측 갱신 실패: ${error.message}`);
    }
  }
} 