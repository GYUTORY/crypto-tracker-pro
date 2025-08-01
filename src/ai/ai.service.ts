import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '../config/config.service';
import Logger from '../shared/logger';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    // Config에서 Google AI 설정 가져오기
    const googleAIConfig = this.configService.getGoogleAIConfig();
    Logger.info(`Google AI API Key: ${googleAIConfig.apiKey.substring(0, 10)}...`);
    Logger.info(`Google AI Model: ${googleAIConfig.model}`);
    this.genAI = new GoogleGenerativeAI(googleAIConfig.apiKey);
  }


  async analyzeTechnicalIndicators(data: any): Promise<any> {
    try {
      // Google Gemini AI 분석
      const analysis = await this.performAIAnalysis(data);
      
      Logger.info(`AI analysis completed for price: ${data.price}`);
      return analysis;
    } catch (error) {
      Logger.error(`Error in AI analysis: ${error.message}`);
      throw new Error('AI 분석 중 오류가 발생했습니다.');
    }
  }

  private async performAIAnalysis(data: any): Promise<any> {
    const prompt = `당신은 암호화폐 투자 초보자를 위한 친근한 투자 상담사입니다. 
다음 기술적 지표를 분석해서 JSON 형식으로만 응답해주세요:

현재 ${data.symbol || '암호화폐'} 시장 상황:
- 현재 가격: ${data.price}달러
- RSI: ${data.rsi} (30 이하면 과매도, 70 이상이면 과매수)
- MACD: ${data.macd} (시그널: ${data.macdSignal})
- 볼린저 밴드: 상단 ${data.bollingerUpper}달러, 하단 ${data.bollingerLower}달러
- 20일 평균가: ${data.ma20}달러
- 50일 평균가: ${data.ma50}달러
- 거래량: ${data.volume} (전일 대비 ${data.volumeChange}% 변화)

다음 JSON 형식으로 분석해주세요:

{
  "rsi": {
    "value": ${data.rsi},
    "signal": "buy|sell|neutral",
    "explanation": "RSI 분석 설명"
  },
  "macd": {
    "value": ${data.macd},
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
      // Google Gemini AI 호출
      Logger.info('Calling Google Gemini AI...');
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      Logger.info('Model created, generating content...');
      const result = await model.generateContent(prompt);
      Logger.info('Content generated, getting response...');
      const response = await result.response;
      const text = response.text();
      Logger.info(`AI Response received: ${text}`);

      // JSON 파싱 시도
      try {
        // Gemini가 ```json\n...\n``` 형식으로 반환할 수 있으므로 처리
        let jsonText = text.trim();
        if (jsonText.startsWith('```json\n')) {
          jsonText = jsonText.substring(7);
        }
        if (jsonText.endsWith('\n```')) {
          jsonText = jsonText.substring(0, jsonText.length - 4);
        }
        
        const analysis = JSON.parse(jsonText);
        Logger.info('Google Gemini AI analysis completed successfully');
        return analysis;
      } catch (parseError) {
        Logger.warn(`AI response parsing failed: ${parseError.message}`);
        Logger.warn(`Raw response: ${text}`);
        throw new Error('AI 응답 파싱에 실패했습니다.');
      }
    } catch (apiError) {
      Logger.warn(`Google Gemini API failed: ${apiError.message}`);
      throw new Error('Google Gemini API 호출에 실패했습니다.');
    }
  }
} 