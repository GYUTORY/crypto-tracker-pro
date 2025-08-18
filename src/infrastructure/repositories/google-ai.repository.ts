/**
 * Google AI Repository 구현체
 * 
 * 이 클래스는 Clean Architecture의 Repository 패턴을 구현하여
 * Google Gemini AI를 사용한 기술적 분석 기능을 제공합니다.
 * 
 * 주요 기능:
 * - Google Gemini AI API 연동
 * - 기술적 지표 분석
 * - 도메인 엔티티와의 연동
 * 
 * Clean Architecture에서의 역할:
 * - Infrastructure Layer에 위치
 * - Domain Layer의 AiRepository 인터페이스 구현
 * - 외부 AI 서비스와의 실제 통신 담당
 * 
 * 사용 예시:
 * ```typescript
 * const aiRepo = new GoogleAiRepository(configService);
 * const analysis = await aiRepo.analyzeTechnicalIndicators(
 *   'BTCUSDT', 
 *   '45000', 
 *   technicalData
 * );
 * ```
 */
import { Injectable, Inject } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '../../config/config.service';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { PricePrediction } from '../../domain/entities/price-prediction.entity';
import { TechnicalAnalysisSchema, PricePredictionSchema, TechnicalAnalysisResponse, PricePredictionResponse } from '../../domain/schemas/ai.schemas';
import Logger from '../../shared/logger';

@Injectable()
export class GoogleAiRepository implements AiRepository {
  // Google Generative AI 인스턴스 (private으로 외부에서 직접 접근 불가)
  private genAI: GoogleGenerativeAI;
  
  // AI 서비스 연결 상태 (private으로 외부에서 직접 접근 불가)
  private _isConnected = false;

  /**
   * 생성자 - Google AI Repository 초기화
   * 
   * @param configService - 설정 서비스 (API 키, 모델명 등 가져오기)
   * 
   * 동작 과정:
   * 1. ConfigService에서 Google AI 설정 가져오기
   * 2. GoogleGenerativeAI 인스턴스 생성
   * 3. 연결 상태를 true로 설정
   * 4. 초기화 완료 로그 출력
   */
  constructor(private readonly configService: ConfigService) {
    // ConfigService에서 Google AI 설정 가져오기
    const googleAIConfig = this.configService.getGoogleAIConfig();
    
    // Google Generative AI 인스턴스 생성
    this.genAI = new GoogleGenerativeAI(googleAIConfig.apiKey);
    
    // 연결 상태를 true로 설정 (초기화 성공)
    this._isConnected = true;
    
    // 초기화 완료 로그
    Logger.info(`Google AI 초기화 완료: ${googleAIConfig.model}`);
  }

  /**
   * 기술적 지표 분석 메인 메서드
   * 
   * @param symbol - 분석할 암호화폐 심볼 (예: 'BTCUSDT')
   * @param price - 현재 가격 (문자열 형태)
   * @param technicalData - 기술적 지표 데이터
   * @returns TechnicalAnalysis 도메인 엔티티
   * 
   * 동작 과정:
   * 1. AI 분석 수행 (performAIAnalysis 호출)
   * 2. 분석 결과를 TechnicalAnalysis 도메인 엔티티로 변환
   * 3. 결과 반환
   * 4. 오류 발생 시 적절한 에러 메시지 반환
   * 
   * Clean Architecture 관점:
   * - Domain Layer의 TechnicalAnalysis 엔티티를 반환
   * - 비즈니스 로직은 Domain Layer에 위임
   */
  async analyzeTechnicalIndicators(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<TechnicalAnalysisResponse> {
    try {
      // AI 분석 수행
      const analysis = await this.performAIAnalysis(symbol, price, technicalData);
      
      // 분석 결과를 TechnicalAnalysis 도메인 엔티티로 변환
      // Domain Layer의 create 메서드를 사용하여 엔티티 생성
      return analysis;
    } catch (error) {
      // 오류 발생 시 로그 및 에러 메시지 반환
      Logger.error(`AI 분석 오류: ${error.message}`);
      throw new Error('AI 분석 중 오류가 발생했습니다.');
    }
  }

  /**
   * 가격 예측 메인 메서드
   * 
   * @param symbol - 예측할 암호화폐 심볼 (예: 'BTCUSDT', 'SHIBKRW')
   * @param currentPrice - 현재 가격 (문자열 형태)
   * @param technicalData - 기술적 지표 데이터
   * @returns PricePrediction 도메인 엔티티
   * 
   * 동작 과정:
   * 1. AI 예측 수행 (performPricePrediction 호출)
   * 2. 예측 결과를 PricePrediction 도메인 엔티티로 변환
   * 3. 결과 반환
   * 4. 오류 발생 시 적절한 에러 메시지 반환
   * 
   * Clean Architecture 관점:
   * - Domain Layer의 PricePrediction 엔티티를 반환
   * - 비즈니스 로직은 Domain Layer에 위임
   */
  async predictPrice(
    symbol: string,
    currentPrice: string,
    technicalData: TechnicalData
  ): Promise<PricePrediction> {
    try {
      // AI 예측 수행 (원본 심볼명 그대로 사용)
      const prediction = await this.performPricePrediction(symbol, currentPrice, technicalData);
      
      // 예측 결과를 PricePrediction 도메인 엔티티로 변환
      // Domain Layer의 create 메서드를 사용하여 엔티티 생성
      return PricePrediction.create(
        symbol,
        currentPrice,
        prediction.predictions,
        prediction.supportLevels || [],
        prediction.resistanceLevels || [],
        prediction.confidence || 50,
        prediction.analysis || {}
      );
    } catch (error) {
      // 예상치 못한 오류 발생 시에만 에러를 던짐
      Logger.error(`AI 가격 예측 예상치 못한 오류: ${error.message}`);
      throw new Error('AI 가격 예측 중 예상치 못한 오류가 발생했습니다.');
    }
  }

  /**
   * AI 서비스 연결 상태 확인 메서드
   * 
   * @returns boolean - 연결 상태 (true: 연결됨, false: 연결 안됨)
   * 
   * 용도:
   * - 헬스체크나 모니터링에서 사용
   * - AI 서비스 사용 가능 여부 확인
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * 기술적 분석 수행
   * 
   * @param symbol - 분석할 암호화폐 심볼
   * @param price - 현재 가격
   * @param technicalData - 기술적 지표 데이터
   * @returns 분석 결과
   */
  private async performAIAnalysis(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<TechnicalAnalysisResponse> {
    // 분석 프롬프트 생성
    const prompt = `
당신은 암호화폐 투자 초보자를 위한 친근한 투자 상담사입니다. 
다음 기술적 지표를 분석해서 JSON 형식으로만 응답해주세요:

현재 ${symbol} 시장 상황:
- 현재 가격: ${price}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- RSI: ${technicalData.rsi} (30 이하면 과매도, 70 이상이면 과매수)
- MACD: ${technicalData.macd} (시그널: ${technicalData.macdSignal})
- 볼린저 밴드: 상단 ${technicalData.bollingerUpper}${symbol.endsWith('KRW') ? '원' : 'USDT'}, 하단 ${technicalData.bollingerLower}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- 20일 평균가: ${technicalData.ma20}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- 50일 평균가: ${technicalData.ma50}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- 거래량: ${technicalData.volume} (전일 대비 ${technicalData.volumeChange}% 변화)

다음 JSON 형식으로 분석해주세요:

{
  "rsi": {
    "value": ${technicalData.rsi},
    "signal": "buy|sell|neutral",
    "explanation": "RSI 분석 설명"
  },
  "macd": {
    "value": ${technicalData.macd},
    "signal": "buy|sell|neutral", 
    "explanation": "MACD 분석 설명"
  },
  "bollinger": {
    "position": "upper|middle|lower",
    "signal": "buy|sell|neutral",
    "explanation": "볼린저 밴드 분석 설명"
  },
  "movingAverages": {
    "signal": "buy|sell|neutral",
    "explanation": "이동평균 분석 설명"
  },
  "overallSignal": "buy|sell|neutral",
  "confidence": 0-100,
  "simpleAdvice": "초보자를 위한 한 줄 조언",
  "riskLevel": "low|medium|high",
  "riskExplanation": "위험도 설명"
}`;

    try {
      // 설정에서 모델명 가져오기
      const googleAIConfig = this.configService.getGoogleAIConfig();
      const model = this.genAI.getGenerativeModel({ model: googleAIConfig.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 파싱 (마크다운 코드 블록 제거)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json\n')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.endsWith('\n```')) {
        jsonText = jsonText.substring(0, jsonText.length - 4);
      }
      
      const rawAnalysis = JSON.parse(jsonText);
      
      // Zod 스키마로 응답 검증
      try {
        const validatedAnalysis = TechnicalAnalysisSchema.parse(rawAnalysis);
        return validatedAnalysis;
      } catch (validationError) {
        Logger.error('AI 응답 스키마 검증 실패:', null, { 
          error: validationError.message,
          rawResponse: rawAnalysis 
        });
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      Logger.error(`Gemini API 호출 실패: ${error.message}`);
      throw new Error('기술적 분석 수행에 실패했습니다.');
    }
  }

  /**
   * 가격 예측 수행
   * 
   * @param symbol - 예측할 암호화폐 심볼
   * @param currentPrice - 현재 가격
   * @param technicalData - 기술적 지표 데이터
   * @returns 예측 결과
   */
  private async performPricePrediction(
    symbol: string,
    currentPrice: string,
    technicalData: TechnicalData
  ): Promise<PricePredictionResponse> {
    // 예측 프롬프트 생성
    const prompt = `
당신은 암호화폐 투자 전문가입니다. 
다음 기술적 지표를 기반으로 ${symbol}의 미래 가격을 예측해주세요:

현재 ${symbol} 시장 상황:
- 현재 가격: ${currentPrice}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- RSI: ${technicalData.rsi} (30 이하면 과매도, 70 이상이면 과매수)
- MACD: ${technicalData.macd} (시그널: ${technicalData.macdSignal})
- 볼린저 밴드: 상단 ${technicalData.bollingerUpper}${symbol.endsWith('KRW') ? '원' : 'USDT'}, 하단 ${technicalData.bollingerLower}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- 20일 평균가: ${technicalData.ma20}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- 50일 평균가: ${technicalData.ma50}${symbol.endsWith('KRW') ? '원' : 'USDT'}
- 거래량: ${technicalData.volume} (전일 대비 ${technicalData.volumeChange}% 변화)

다음 JSON 형식으로 가격 예측을 제공해주세요. 반드시 완전한 JSON을 제공하세요:

{
  "predictions": [
    {
      "timeframe": "1h",
      "predictedPrice": "가격",
      "confidence": 60,
      "changePercent": 0.1,
      "trend": "neutral",
      "explanation": "1시간 예측 근거"
    },
    {
      "timeframe": "4h",
      "predictedPrice": "가격",
      "confidence": 65,
      "changePercent": 0.8,
      "trend": "bullish",
      "explanation": "4시간 예측 근거"
    },
    {
      "timeframe": "24h",
      "predictedPrice": "가격",
      "confidence": 70,
      "changePercent": 2.1,
      "trend": "bullish",
      "explanation": "24시간 예측 근거"
    }
  ],
  "supportLevels": ["지지선1", "지지선2"],
  "resistanceLevels": ["저항선1", "저항선2"],
  "confidence": 65,
  "analysis": {
    "marketSentiment": "bullish",
    "keyFactors": ["주요 요인1", "주요 요인2"],
    "riskFactors": ["위험 요인1", "위험 요인2"],
    "recommendation": "투자 추천",
    "disclaimer": "면책 조항"
  }
}`;

    try {
      // 설정에서 모델명 가져오기
      const googleAIConfig = this.configService.getGoogleAIConfig();
      const model = this.genAI.getGenerativeModel({ model: googleAIConfig.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 디버깅을 위해 원본 응답 로깅
      Logger.debug(`AI 원본 응답 (${symbol}):`, null, { rawResponse: text });

      // JSON 파싱 (마크다운 코드 블록 제거)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json\n')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.endsWith('\n```')) {
        jsonText = jsonText.substring(0, jsonText.length - 4);
      }
      
      // JSON 파싱 시도
      let rawPrediction;
      try {
        rawPrediction = JSON.parse(jsonText);
      } catch (parseError) {
        Logger.error(`JSON 파싱 실패 (${symbol}):`, null, { 
          error: parseError.message,
          jsonText: jsonText.substring(0, 1000) + '...' // 처음 1000자만 로깅
        });
        
        // JSON 복구 시도
        const recoveredJson = this.tryToRecoverJson(jsonText);
        if (recoveredJson) {
          try {
            rawPrediction = JSON.parse(recoveredJson);
            Logger.info(`JSON 복구 성공 (${symbol})`);
          } catch (recoveryError) {
            Logger.error(`JSON 복구 실패 (${symbol}):`, null, { error: recoveryError.message });
            throw new Error(`JSON 파싱 및 복구 실패: ${parseError.message}`);
          }
        } else {
          throw new Error(`JSON 파싱 오류: ${parseError.message}`);
        }
      }
      
      // Zod 스키마로 응답 검증
      try {
        const validatedPrediction = PricePredictionSchema.parse(rawPrediction);
        return validatedPrediction;
      } catch (validationError) {
        Logger.error('AI 예측 응답 스키마 검증 실패:', null, { 
          error: validationError.message,
          rawResponse: rawPrediction 
        });
        
        // 검증 실패 시 기본값 반환
        Logger.warn(`AI 응답 검증 실패로 기본값 사용 (${symbol})`);
        return this.getDefaultPricePrediction(symbol, currentPrice);
      }
    } catch (error) {
      Logger.error(`Gemini 가격 예측 실패: ${error.message}`);
      
      // 모든 파싱 실패 시 기본값 반환
      Logger.warn(`AI 예측 실패로 기본값 사용 (${symbol})`);
      return this.getDefaultPricePrediction(symbol, currentPrice);
    }
  }

  /**
   * 기본 가격 예측 반환 (AI 실패 시 fallback)
   */
  private getDefaultPricePrediction(symbol: string, currentPrice: string): PricePredictionResponse {
    const currentPriceNum = parseFloat(currentPrice);
    
    return {
      predictions: [
        {
          timeframe: '1h',
          predictedPrice: (currentPriceNum * 1.001).toFixed(8),
          confidence: 50,
          changePercent: 0.1,
          trend: 'neutral',
          explanation: '기본 예측: 현재 가격 유지 추세'
        },
        {
          timeframe: '4h',
          predictedPrice: (currentPriceNum * 1.002).toFixed(8),
          confidence: 55,
          changePercent: 0.2,
          trend: 'neutral',
          explanation: '기본 예측: 소폭 상승 가능성'
        },
        {
          timeframe: '24h',
          predictedPrice: (currentPriceNum * 1.005).toFixed(8),
          confidence: 60,
          changePercent: 0.5,
          trend: 'bullish',
          explanation: '기본 예측: 단기 상승 추세'
        }
      ],
      supportLevels: [(currentPriceNum * 0.98).toFixed(8)],
      resistanceLevels: [(currentPriceNum * 1.02).toFixed(8)],
      confidence: 55,
      analysis: {
        marketSentiment: 'neutral',
        keyFactors: ['기본 기술적 분석'],
        riskFactors: ['AI 분석 실패로 인한 제한적 정보'],
        recommendation: 'AI 분석이 일시적으로 실패했습니다. 신중한 투자 결정을 권장합니다.',
        disclaimer: '이 예측은 기본값이며, 실제 투자 결정 시 추가 분석이 필요합니다.'
      }
    };
  }

  /**
   * 불완전한 JSON을 복구하는 메서드
   */
  private tryToRecoverJson(jsonText: string): string | null {
    try {
      // 중괄호 개수 확인
      const openBraces = (jsonText.match(/\{/g) || []).length;
      const closeBraces = (jsonText.match(/\}/g) || []).length;
      
      // 대괄호 개수 확인
      const openBrackets = (jsonText.match(/\[/g) || []).length;
      const closeBrackets = (jsonText.match(/\]/g) || []).length;
      
      let recoveredJson = jsonText;
      
      // 중괄호가 부족하면 추가
      for (let i = 0; i < openBraces - closeBraces; i++) {
        recoveredJson += '}';
      }
      
      // 대괄호가 부족하면 추가
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        recoveredJson += ']';
      }
      
      // 마지막에 쉼표가 있으면 제거
      recoveredJson = recoveredJson.replace(/,\s*([}\]])/g, '$1');
      
      // 테스트 파싱
      JSON.parse(recoveredJson);
      return recoveredJson;
    } catch (error) {
      return null;
    }
  }
} 