/**
 * 바이낸스 API 구현체
 * 
 * 바이낸스 REST API를 통해 암호화폐 데이터를 가져옵니다.
 * WebSocket 관련 기능은 BinanceStreamingRepository로 분리됩니다.
 */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Price } from '../../domain/entities/price.entity';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { ConfigService } from '../../config/config.service';
import Logger from '../../shared/logger';

@Injectable()
export class BinanceApiRepository implements BinanceRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const binanceConfig = this.configService.getBinanceConfig();
    this.baseUrl = binanceConfig.baseUrl;
  }

  /**
   * REST API를 통해 특정 심볼의 현재 가격을 조회
   * 
   * WebSocket 데이터가 없거나 만료된 경우의 폴백 메커니즘으로 사용됩니다.
   * 바이낸스 API v3의 ticker/price 엔드포인트를 호출합니다.
   */
  async getCurrentPrice(symbol: string): Promise<Price> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });

      // API 응답을 도메인 엔티티로 변환
      return Price.create(
        response.data.symbol,
        response.data.price
      );
    } catch (error) {
      // 400 에러는 잘못된 심볼을 의미
      if (error.response?.status === 400) {
        throw new Error(`잘못된 심볼: ${symbol}`);
      }
      throw new Error(`${symbol} 가격 조회 실패: ${error.message}`);
    }
  }

  /**
   * 심볼별 현재 가격 조회 (문자열 반환)
   * @param symbol - 조회할 암호화폐 심볼
   * @returns 현재 가격 (문자열)
   */
  async getSymbolPrice(symbol: string): Promise<string> {
    try {
      Logger.info(`${symbol} 가격 조회 시작`);
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });
      
      Logger.info(`${symbol} 가격 조회 성공: ${response.data.price}`);
      return response.data.price;
    } catch (error) {
      Logger.error(`${symbol} 가격 조회 실패: ${error.message} - Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`);
      throw new Error(`${symbol}의 현재 가격을 가져올 수 없습니다.`);
    }
  }

  /**
   * 심볼별 24시간 통계 데이터 조회
   * @param symbol - 조회할 암호화폐 심볼
   * @returns 24시간 통계 데이터
   */
  async get24hrStats(symbol: string): Promise<any> {
    try {
      Logger.info(`${symbol} 24시간 통계 조회 시작`);
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      
      const data = response.data;
      
      // 거래량 포맷팅 (B, M, K 단위)
      const volume = this.formatVolume(data.volume);
      
      // 변동률 계산 및 포맷팅
      const changePercent = parseFloat(data.priceChangePercent);
      const change = changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;
      
      Logger.info(`${symbol} 24시간 통계 조회 성공`);
      return {
        symbol: data.symbol,
        price: data.lastPrice,
        change,
        changePercent,
        volume24h: volume,
        high24h: data.highPrice,
        low24h: data.lowPrice,
        volume: data.volume,
        quoteVolume: data.quoteVolume,
        timestamp: Date.now()
      };
    } catch (error) {
      Logger.error(`${symbol} 24시간 통계 조회 실패: ${error.message}`);
      throw new Error(`${symbol}의 24시간 통계 데이터를 가져올 수 없습니다.`);
    }
  }

  /**
   * 거래량 포맷팅 (B, M, K 단위)
   * @param volume - 원본 거래량
   * @returns 포맷된 거래량
   */
  private formatVolume(volume: string): string {
    const num = parseFloat(volume);
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(1)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(1)}K`;
    }
    return num.toFixed(0);
  }

  /**
   * 차트 데이터 조회
   * @param symbol - 조회할 암호화폐 심볼
   * @param timeframe - 시간 단위 (1h, 4h, 1d, 1w)
   * @param limit - 데이터 포인트 수
   * @returns 차트 데이터
   */
  async getChartData(symbol: string, timeframe: string = '1h', limit: number = 24): Promise<any> {
    try {
      Logger.info(`${symbol} 차트 데이터 조회 시작 (${timeframe}, ${limit}개)`);
      
      // 바이낸스 API interval 매핑
      const intervalMap: { [key: string]: string } = {
        '1h': '1h',
        '4h': '4h', 
        '1d': '1d',
        '1w': '1w'
      };
      
      const interval = intervalMap[timeframe] || '1h';
      
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit
        }
      });
      
      const data = response.data.map((kline: any) => ({
        timestamp: kline[0], // 시가 시간
        price: kline[4],     // 종가
        volume: kline[5],    // 거래량
        high: kline[2],      // 고가
        low: kline[3]        // 저가
      }));
      
      Logger.info(`${symbol} 차트 데이터 조회 성공: ${data.length}개 포인트`);
      
      return {
        symbol: symbol.toUpperCase(),
        timeframe,
        data
      };
    } catch (error) {
      Logger.error(`${symbol} 차트 데이터 조회 실패: ${error.message}`);
      throw new Error(`${symbol}의 차트 데이터를 가져올 수 없습니다.`);
    }
  }

  /**
   * 거래 가능한 심볼 목록 조회
   * @returns 거래 가능한 심볼 목록
   */
  async getTradingSymbols(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/exchangeInfo`);
      const symbols = response.data.symbols
        .filter((symbol: any) => symbol.status === 'TRADING')
        .map((symbol: any) => symbol.symbol);
      
      Logger.info(`바이낸스 거래 가능 심볼 ${symbols.length}개 조회 완료`);
      return symbols;
    } catch (error) {
      Logger.error(`바이낸스 심볼 목록 조회 실패: ${error.message}`);
      throw new Error('거래 가능한 심볼 목록을 가져올 수 없습니다.');
    }
  }

  /**
   * 특정 심볼의 기술적 지표 데이터 조회
   * @param symbol - 조회할 암호화폐 심볼
   * @returns 기술적 지표 데이터
   */
  async getTechnicalData(symbol: string): Promise<TechnicalData> {
    try {
      // 24시간 통계 데이터 조회
      const tickerResponse = await axios.get(`${this.baseUrl}/api/v3/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      
      const tickerData = tickerResponse.data;
      
      // 최근 가격 데이터 조회 (RSI, MACD 계산용)
      const klinesResponse = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: '1d',
          limit: 50
        }
      });
      
      const klines = klinesResponse.data;
      
      // 기술적 지표 계산
      const technicalData = this.calculateTechnicalIndicators(klines, tickerData);
      
      Logger.info(`${symbol} 기술적 지표 데이터 조회 완료`);
      return technicalData;
    } catch (error) {
      Logger.error(`${symbol} 기술적 지표 데이터 조회 실패: ${error.message}`);
      throw new Error(`${symbol}의 기술적 지표 데이터를 가져올 수 없습니다.`);
    }
  }

  /**
   * 기술적 지표 계산
   * @param klines - 캔들스틱 데이터
   * @param tickerData - 24시간 통계 데이터
   * @returns 계산된 기술적 지표
   */
  private calculateTechnicalIndicators(klines: any[], tickerData: any): TechnicalData {
    const prices = klines.map((kline: any) => parseFloat(kline[4])); // 종가
    const volumes = klines.map((kline: any) => parseFloat(kline[5])); // 거래량
    
    // RSI 계산 (14일)
    const rsi = this.calculateRSI(prices, 14);
    
    // MACD 계산
    const { macd, macdSignal } = this.calculateMACD(prices);
    
    // 볼린저 밴드 계산 (20일)
    const { upper: bollingerUpper, lower: bollingerLower } = this.calculateBollingerBands(prices, 20);
    
    // 이동평균 계산
    const ma20 = this.calculateSMA(prices, 20);
    const ma50 = this.calculateSMA(prices, 50);
    
    // 거래량 변화율
    const volumeChange = this.calculateVolumeChange(volumes);
    
    return {
      rsi,
      macd,
      macdSignal,
      bollingerUpper: bollingerUpper.toFixed(8),
      bollingerLower: bollingerLower.toFixed(8),
      ma20: ma20.toFixed(8),
      ma50: ma50.toFixed(8),
      volume: tickerData.volume,
      volumeChange: volumeChange.toFixed(2)
    };
  }

  /**
   * RSI 계산
   */
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50; // 기본값
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * MACD 계산
   */
  private calculateMACD(prices: number[]): { macd: number; macdSignal: number } {
    if (prices.length < 26) return { macd: 0, macdSignal: 0 };
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // MACD 시그널 라인 (9일 EMA)
    const macdValues = prices.map((_, i) => {
      if (i < 25) return 0;
      const ema12_i = this.calculateEMA(prices.slice(0, i + 1), 12);
      const ema26_i = this.calculateEMA(prices.slice(0, i + 1), 26);
      return ema12_i - ema26_i;
    });
    
    const macdSignal = this.calculateEMA(macdValues, 9);
    
    return { macd, macdSignal };
  }

  /**
   * 볼린저 밴드 계산
   */
  private calculateBollingerBands(prices: number[], period: number): { upper: number; lower: number } {
    if (prices.length < period) return { upper: prices[prices.length - 1], lower: prices[prices.length - 1] };
    
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (2 * standardDeviation),
      lower: sma - (2 * standardDeviation)
    };
  }

  /**
   * 단순 이동평균 계산
   */
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  /**
   * 지수 이동평균 계산
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  /**
   * 거래량 변화율 계산
   */
  private calculateVolumeChange(volumes: number[]): number {
    if (volumes.length < 2) return 0;
    
    const currentVolume = volumes[volumes.length - 1];
    const previousVolume = volumes[volumes.length - 2];
    
    if (previousVolume === 0) return 0;
    
    return ((currentVolume - previousVolume) / previousVolume) * 100;
  }
} 