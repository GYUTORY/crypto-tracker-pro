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
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TechnicalAnalysis, TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { PricePrediction, TimeframePrediction, PredictionAnalysis } from '../../domain/entities/price-prediction.entity';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { ConfigService } from '../../config/config.service';
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
  ): Promise<TechnicalAnalysis> {
    try {
      // AI 분석 수행
      const analysis = await this.performAIAnalysis(symbol, price, technicalData);
      
      // 분석 결과를 TechnicalAnalysis 도메인 엔티티로 변환
      // Domain Layer의 create 메서드를 사용하여 엔티티 생성
      return TechnicalAnalysis.create(
        symbol,
        price,
        technicalData,
        analysis
      );
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
        prediction.supportLevels,
        prediction.resistanceLevels,
        prediction.confidence,
        prediction.analysis
      );
    } catch (error) {
      // 오류 발생 시 로그 및 에러 메시지 반환
      Logger.error(`AI 가격 예측 오류: ${error.message}`);
      throw new Error('AI 가격 예측 중 오류가 발생했습니다.');
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
   * 실제 AI 분석을 수행하는 private 메서드
   * 
   * @param symbol - 분석할 암호화폐 심볼
   * @param price - 현재 가격
   * @param technicalData - 기술적 지표 데이터
   * @returns AI 분석 결과 (any 타입 - JSON 파싱 결과)
   * 
   * 동작 과정:
   * 1. AI에게 보낼 프롬프트 생성
   * 2. Google Gemini AI API 호출
   * 3. 응답 받기 및 JSON 파싱
   * 4. 결과 반환
   * 
   * 주의사항:
   * - Gemini가 ```json\n...\n``` 형식으로 응답할 수 있어서 이를 처리
   * - JSON 파싱 실패 시 적절한 에러 처리
   * - API 호출 실패 시 적절한 에러 처리
   */
  private async performAIAnalysis(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<any> {
    // AI에게 보낼 프롬프트 생성
    // 이 프롬프트는 AI가 어떤 역할을 하고, 어떤 형식으로 응답해야 하는지 정의
    // 기술적 지표들의 의미와 해석 방법도 함께 제공
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
      // Google Gemini AI API 호출 과정
      Logger.info('Google Gemini AI 호출 중...');
      
      // Gemini 모델 생성 (gemini-1.5-pro 모델 사용)
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // AI에게 프롬프트 전송하고 응답 생성
      const result = await model.generateContent(prompt);
      
      // 응답에서 텍스트 추출
      const response = await result.response;
      const text = response.text();
      Logger.info(`AI 응답 수신: ${text}`);

      // JSON 파싱 과정
      // Gemini가 ```json\n...\n``` 형식으로 반환할 수 있으므로 처리
      // 예: ```json\n{"key": "value"}\n``` → {"key": "value"}
      let jsonText = text.trim();
      
      // 시작 부분에 ```json\n이 있으면 제거
      if (jsonText.startsWith('```json\n')) {
        jsonText = jsonText.substring(7);
      }
      
      // 끝 부분에 \n```이 있으면 제거
      if (jsonText.endsWith('\n```')) {
        jsonText = jsonText.substring(0, jsonText.length - 4);
      }
      
      // JSON 문자열을 JavaScript 객체로 변환
      const analysis = JSON.parse(jsonText);
      Logger.info('Google Gemini AI 분석 완료');
      return analysis;
    } catch (error) {
      // Google Gemini API 호출 실패 시 로그 및 에러 처리
      Logger.error(`Google Gemini API 실패: ${error.message}`);
      throw new Error('Google Gemini API 호출에 실패했습니다.');
    }
  }

  /**
   * 실제 AI 가격 예측을 수행하는 private 메서드
   * 
   * @param symbol - 예측할 암호화폐 심볼
   * @param currentPrice - 현재 가격
   * @param technicalData - 기술적 지표 데이터
   * @returns AI 예측 결과 (any 타입 - JSON 파싱 결과)
   * 
   * 동작 과정:
   * 1. AI에게 보낼 예측 프롬프트 생성
   * 2. Google Gemini AI API 호출
   * 3. 응답 받기 및 JSON 파싱
   * 4. 결과 반환
   * 
   * 주의사항:
   * - Gemini가 ```json\n...\n``` 형식으로 응답할 수 있어서 이를 처리
   * - JSON 파싱 실패 시 적절한 에러 처리
   * - API 호출 실패 시 적절한 에러 처리
   */
  private async performPricePrediction(
    symbol: string,
    currentPrice: string,
    technicalData: TechnicalData
  ): Promise<any> {
    // AI에게 보낼 예측 프롬프트 생성
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

다음 JSON 형식으로 가격 예측을 제공해주세요:

{
  "predictions": [
    {
      "timeframe": "1h",
      "predictedPrice": "가격",
      "confidence": 0-100,
      "changePercent": -10.5,
      "trend": "bullish|bearish|neutral",
      "explanation": "1시간 예측 근거"
    },
    {
      "timeframe": "4h",
      "predictedPrice": "가격",
      "confidence": 0-100,
      "changePercent": -5.2,
      "trend": "bullish|bearish|neutral",
      "explanation": "4시간 예측 근거"
    },
    {
      "timeframe": "24h",
      "predictedPrice": "가격",
      "confidence": 0-100,
      "changePercent": 2.1,
      "trend": "bullish|bearish|neutral",
      "explanation": "24시간 예측 근거"
    },
    {
      "timeframe": "1w",
      "predictedPrice": "가격",
      "confidence": 0-100,
      "changePercent": 8.5,
      "trend": "bullish|bearish|neutral",
      "explanation": "1주 예측 근거"
    },
    {
      "timeframe": "1m",
      "predictedPrice": "가격",
      "confidence": 0-100,
      "changePercent": 15.2,
      "trend": "bullish|bearish|neutral",
      "explanation": "1개월 예측 근거"
    },
    {
      "timeframe": "3m",
      "predictedPrice": "가격",
      "confidence": 0-100,
      "changePercent": 25.8,
      "trend": "bullish|bearish|neutral",
      "explanation": "3개월 예측 근거"
    }
  ],
  "supportLevels": ["지지선1", "지지선2", "지지선3"],
  "resistanceLevels": ["저항선1", "저항선2", "저항선3"],
  "confidence": 0-100,
  "analysis": {
    "marketSentiment": "bullish|bearish|neutral",
    "keyFactors": ["주요 요인1", "주요 요인2"],
    "riskFactors": ["위험 요인1", "위험 요인2"],
    "recommendation": "투자 추천",
    "disclaimer": "면책 조항"
  }
}`;

    try {
      // Google Gemini AI API 호출 과정
      Logger.info('Google Gemini AI 가격 예측 호출 중...');
      
      // Gemini 모델 생성 (gemini-1.5-pro 모델 사용)
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // AI에게 프롬프트 전송하고 응답 생성
      const result = await model.generateContent(prompt);
      
      // 응답에서 텍스트 추출
      const response = await result.response;
      const text = response.text();
      Logger.info(`AI 예측 응답 수신: ${text}`);

      // JSON 파싱 과정
      let jsonText = text.trim();
      
      // 시작 부분에 ```json\n이 있으면 제거
      if (jsonText.startsWith('```json\n')) {
        jsonText = jsonText.substring(7);
      }
      
      // 끝 부분에 \n```이 있으면 제거
      if (jsonText.endsWith('\n```')) {
        jsonText = jsonText.substring(0, jsonText.length - 4);
      }
      
      // JSON 문자열을 JavaScript 객체로 변환
      const prediction = JSON.parse(jsonText);
      Logger.info('Google Gemini AI 가격 예측 완료');
      return prediction;
    } catch (error) {
      // Google Gemini API 호출 실패 시 로그 및 에러 처리
      Logger.error(`Google Gemini 가격 예측 API 실패: ${error.message}`);
      throw new Error('Google Gemini 가격 예측 API 호출에 실패했습니다.');
    }
  }
} 