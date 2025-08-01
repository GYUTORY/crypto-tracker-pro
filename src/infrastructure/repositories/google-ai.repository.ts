/**
 * Google AI 구현체
 */
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TechnicalAnalysis, TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { ConfigService } from '../../config/config.service';
import Logger from '../../shared/logger';

@Injectable()
export class GoogleAiRepository implements AiRepository {
  private genAI: GoogleGenerativeAI;
  private _isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const googleAIConfig = this.configService.getGoogleAIConfig();
    this.genAI = new GoogleGenerativeAI(googleAIConfig.apiKey);
    this._isConnected = true;
    Logger.info(`Google AI 초기화 완료: ${googleAIConfig.model}`);
  }

  async analyzeTechnicalIndicators(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<TechnicalAnalysis> {
    try {
      const analysis = await this.performAIAnalysis(symbol, price, technicalData);
      
      return TechnicalAnalysis.create(
        symbol,
        price,
        technicalData,
        analysis
      );
    } catch (error) {
      Logger.error(`AI 분석 오류: ${error.message}`);
      throw new Error('AI 분석 중 오류가 발생했습니다.');
    }
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  private async performAIAnalysis(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<any> {
    const prompt = `당신은 암호화폐 투자 초보자를 위한 친근한 투자 상담사입니다. 
다음 기술적 지표를 분석해서 JSON 형식으로만 응답해주세요:

현재 ${symbol} 시장 상황:
- 현재 가격: ${price}달러
- RSI: ${technicalData.rsi} (30 이하면 과매도, 70 이상이면 과매수)
- MACD: ${technicalData.macd} (시그널: ${technicalData.macdSignal})
- 볼린저 밴드: 상단 ${technicalData.bollingerUpper}달러, 하단 ${technicalData.bollingerLower}달러
- 20일 평균가: ${technicalData.ma20}달러
- 50일 평균가: ${technicalData.ma50}달러
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
      Logger.info('Google Gemini AI 호출 중...');
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      Logger.info(`AI 응답 수신: ${text}`);

      // JSON 파싱
      let jsonText = text.trim();
      if (jsonText.startsWith('```json\n')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.endsWith('\n```')) {
        jsonText = jsonText.substring(0, jsonText.length - 4);
      }
      
      const analysis = JSON.parse(jsonText);
      Logger.info('Google Gemini AI 분석 완료');
      return analysis;
    } catch (error) {
      Logger.error(`Google Gemini API 실패: ${error.message}`);
      throw new Error('Google Gemini API 호출에 실패했습니다.');
    }
  }
} 