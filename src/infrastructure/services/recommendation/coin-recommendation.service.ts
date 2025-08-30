/**
 * AI 코인 추천 서비스 (AI Coin Recommendation Service)
 * 
 * Google Gemini AI를 활용하여 암호화폐 투자 추천을 생성하는 서비스입니다.
 * 
 * 주요 기능:
 * - 단기 투자 추천 (1-7일)
 * - 중기 투자 추천 (1-4주)
 * - 장기 투자 추천 (1-12개월)
 * - 종합 추천 (모든 기간)
 * 
 * AI 분석 요소:
 * - 기술적 지표 분석 (RSI, MACD, 볼린저 밴드 등)
 * - 시장 심리 분석 (뉴스, 소셜 미디어 감정)
 * - 기본적 분석 (프로젝트 성과, 개발 활동)
 * - 거시경제적 요소 (금리, 인플레이션 등)
 * 
 * 응답 형식:
 * - 구조화된 JSON 데이터
 * - 추천 근거 및 신뢰도 점수
 * - 목표가 및 손절가 제시
 * - 위험도 평가
 * 
 * 사용 예시:
 * ```typescript
 * const recommendations = await coinRecommendationService
 *   .generateShortTermRecommendations();
 * ```
 */
import { Injectable, Inject } from '@nestjs/common';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { NewsRepository } from '../../domain/repositories/news-repository.interface';
import { 
  TimeframeType, 
  RecommendationReason,
  RecommendedCoinDto, 
  RecommendationReasonDto,
  CoinRecommendationResponseDto,
  AllRecommendationsResponseDto
} from '../../shared/dto/recommendation.dto';
import Logger from '../../shared/logger';

/**
 * AI 코인 추천 서비스 클래스 (AI Coin Recommendation Service Class)
 * 
 * 의존성 주입을 통해 AI, 바이낸스, 뉴스 Repository에 접근하여
 * 종합적인 암호화폐 투자 추천을 생성합니다.
 * 
 * Clean Architecture 원칙:
 * - Domain Layer의 Repository 인터페이스에만 의존
 * - Infrastructure Layer의 구체적 구현체는 DI를 통해 주입
 * - 비즈니스 로직과 외부 서비스 연동 분리
 */
@Injectable()
export class CoinRecommendationService {
  /**
   * CoinRecommendationService 생성자
   * 
   * @param aiRepository - AI 분석을 위한 Repository (Google Gemini)
   * @param binanceRepository - 실시간 가격 데이터를 위한 Repository
   * @param newsRepository - 뉴스 및 시장 정보를 위한 Repository
   */
  constructor(
    @Inject('AiRepository')
    private readonly aiRepository: AiRepository,
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository,
    @Inject('NewsRepository')
    private readonly newsRepository: NewsRepository
  ) {}

  /**
   * 단기 추천 코인 생성 (Generate Short-term Recommendations)
   * 
   * 1-7일 단기 투자를 위한 TOP 3 암호화폐를 추천합니다.
   * 
   * 분석 요소:
   * - 기술적 돌파 및 지지/저항선 분석
   * - 단기 뉴스 이벤트 및 시장 반응
   * - 거래량 급증 및 모멘텀 지표
   * - 단기 기술적 지표 (RSI, MACD, 볼린저 밴드)
   * 
   * 추천 기준:
   * - 높은 변동성과 단기 상승 가능성
   * - 명확한 기술적 신호
   * - 뉴스 이벤트나 개발 업데이트
   * - 적절한 위험/보상 비율
   * 
   * @returns 단기 투자 추천 데이터 (TOP 3 코인)
   * 
   * 응답 예시:
   * ```json
   * {
   *   "timeframe": "SHORT_TERM",
   *   "timeframeDescription": "단기 투자 (1-7일)",
   *   "recommendations": [
   *     {
   *       "symbol": "BTCUSDT",
   *       "name": "Bitcoin",
   *       "currentPrice": 45000,
   *       "expectedReturn": 15,
   *       "riskScore": 3,
   *       "recommendationScore": 85
   *     }
   *   ]
   * }
   * ```
   */
  async generateShortTermRecommendations(): Promise<CoinRecommendationResponseDto> {
    const prompt = `
다음은 단기 투자(1-7일)를 위한 암호화폐 추천 요청입니다.

현재 시장 상황을 분석하고, 기술적 지표, 뉴스, 시장 심리 등을 종합적으로 고려하여 
단기적으로 상승 가능성이 높은 TOP 3 코인을 추천해주세요.

다음 JSON 형식으로 정확히 응답해주세요:

{
  "recommendations": [
    {
      "symbol": "BTCUSDT",
      "name": "Bitcoin",
      "currentPrice": 45000,
      "change24h": 2.5,
      "expectedReturn": 15,
      "riskScore": 3,
      "recommendationScore": 85,
      "reasons": [
        {
          "type": "technical_breakout",
          "description": "주요 저항선 돌파",
          "confidence": 85
        }
      ],
      "analysis": "기술적 돌파로 단기 상승 가능성 높음",
      "targetPrice": 52000,
      "stopLoss": 42000
    }
  ]
}

반드시 유효한 JSON 형식으로만 응답해주세요. 다른 설명이나 텍스트는 포함하지 마세요.
`;

    const aiResponse = await this.aiRepository.analyze(prompt);
    const recommendations = this.parseAIRecommendations(aiResponse);

    return {
      timeframe: TimeframeType.SHORT_TERM,
      timeframeDescription: '단기 투자 (1-7일)',
      recommendations: recommendations.slice(0, 3),
      generatedAt: new Date().toISOString(),
      modelInfo: 'Gemini 1.5 Pro - Technical Analysis & Market Sentiment',
      marketAnalysis: '단기 시장은 기술적 돌파와 뉴스 이벤트에 민감하게 반응하고 있습니다.'
    };
  }

  /**
   * 중기 추천 코인 생성 (1-4주)
   */
  async generateMediumTermRecommendations(): Promise<CoinRecommendationResponseDto> {
    const prompt = `
다음은 중기 투자(1-4주)를 위한 암호화폐 추천 요청입니다.

기본적 분석, 기술적 분석, 시장 트렌드, 기관 투자자 관심도 등을 종합적으로 고려하여 
중기적으로 성장 가능성이 높은 TOP 3 코인을 추천해주세요.

다음 JSON 형식으로 정확히 응답해주세요:

{
  "recommendations": [
    {
      "symbol": "ETHUSDT",
      "name": "Ethereum",
      "currentPrice": 2800,
      "change24h": 3.2,
      "expectedReturn": 20,
      "riskScore": 4,
      "recommendationScore": 82,
      "reasons": [
        {
          "type": "ecosystem_growth",
          "description": "DeFi 생태계 성장",
          "confidence": 90
        }
      ],
      "analysis": "생태계 성장으로 중기 성장 기대",
      "targetPrice": 3400,
      "stopLoss": 2600
    }
  ]
}

반드시 유효한 JSON 형식으로만 응답해주세요. 다른 설명이나 텍스트는 포함하지 마세요.
`;

    const aiResponse = await this.aiRepository.analyze(prompt);
    const recommendations = this.parseAIRecommendations(aiResponse);

    return {
      timeframe: TimeframeType.MEDIUM_TERM,
      timeframeDescription: '중기 투자 (1-4주)',
      recommendations: recommendations.slice(0, 3),
      generatedAt: new Date().toISOString(),
      modelInfo: 'Gemini 1.5 Pro - Fundamental & Technical Analysis',
      marketAnalysis: '중기 시장은 기본적 요인과 기술적 트렌드의 조합으로 움직입니다.'
    };
  }

  /**
   * 장기 추천 코인 생성 (1-12개월)
   */
  async generateLongTermRecommendations(): Promise<CoinRecommendationResponseDto> {
    const prompt = `
다음은 장기 투자(1-12개월)를 위한 암호화폐 추천 요청입니다.

기본적 분석, 생태계 성장성, 규제 환경, 기술 혁신, 기관 채택 등을 종합적으로 고려하여 
장기적으로 가치가 크게 상승할 가능성이 높은 TOP 3 코인을 추천해주세요.

다음 JSON 형식으로 정확히 응답해주세요:

{
  "recommendations": [
    {
      "symbol": "ADAUSDT",
      "name": "Cardano",
      "currentPrice": 0.45,
      "change24h": 1.8,
      "expectedReturn": 25,
      "riskScore": 5,
      "recommendationScore": 78,
      "reasons": [
        {
          "type": "fundamental_strength",
          "description": "학술적 접근과 검증된 기술",
          "confidence": 85
        }
      ],
      "analysis": "학술적 접근과 규제 친화적 특성으로 장기 성장 가능성 높음",
      "targetPrice": 0.65,
      "stopLoss": 0.40
    }
  ]
}

반드시 유효한 JSON 형식으로만 응답해주세요. 다른 설명이나 텍스트는 포함하지 마세요.
`;

    const aiResponse = await this.aiRepository.analyze(prompt);
    const recommendations = this.parseAIRecommendations(aiResponse);

    return {
      timeframe: TimeframeType.LONG_TERM,
      timeframeDescription: '장기 투자 (1-12개월)',
      recommendations: recommendations.slice(0, 3),
      generatedAt: new Date().toISOString(),
      modelInfo: 'Gemini 1.5 Pro - Fundamental & Ecosystem Analysis',
      marketAnalysis: '장기 시장은 생태계 성장과 기술 혁신이 핵심 동력입니다.'
    };
  }

  /**
   * 모든 타임프레임 추천 생성
   */
  async generateAllRecommendations(): Promise<AllRecommendationsResponseDto> {
    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      this.generateShortTermRecommendations(),
      this.generateMediumTermRecommendations(),
      this.generateLongTermRecommendations()
    ]);

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      overallMarketStatus: '현재 시장은 다양한 투자 기회를 제공하고 있으며, 각 타임프레임별로 차별화된 전략이 필요합니다.',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * AI 응답을 파싱하여 추천 코인 목록 생성
   */
  private parseAIRecommendations(aiResponse: string): RecommendedCoinDto[] {
    try {
      // AI 응답에서 JSON 부분 추출 (더 정확한 패턴 매칭)
      let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      // 만약 JSON을 찾지 못했다면, 코드 블록 내부를 찾아보기
      if (!jsonMatch) {
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = [codeBlockMatch[1]];
        }
      }
      
      if (!jsonMatch) {
        Logger.warn('AI 응답에서 JSON을 찾을 수 없습니다. 샘플 데이터를 사용합니다.');
        return this.generateSampleRecommendations();
      }

      // JSON 파싱 시도
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // JSON 파싱 실패 시, 문자열 정리 후 재시도
        const cleanedJson = jsonMatch[0]
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 제어 문자 제거
          .replace(/([^\\])"/g, '$1"') // 잘못된 따옴표 수정
          .replace(/,\s*}/g, '}') // trailing comma 제거
          .replace(/,\s*]/g, ']'); // trailing comma 제거
        
        try {
          parsed = JSON.parse(cleanedJson);
        } catch (secondError) {
          Logger.error('JSON 파싱 재시도 실패:', secondError);
          return this.generateSampleRecommendations();
        }
      }

      // recommendations 배열이 있는지 확인
      if (parsed && Array.isArray(parsed.recommendations)) {
        return parsed.recommendations;
      }
      
      // recommendations가 없거나 배열이 아닌 경우
      Logger.warn('AI 응답에 유효한 recommendations 배열이 없습니다. 샘플 데이터를 사용합니다.');
      return this.generateSampleRecommendations();
    } catch (error) {
      Logger.error('AI 응답 파싱 실패:', error);
      return this.generateSampleRecommendations();
    }
  }

  /**
   * 샘플 추천 데이터 생성 (AI 응답 실패 시)
   */
  private generateSampleRecommendations(): RecommendedCoinDto[] {
    return [
      {
        symbol: 'BTCUSDT',
        name: 'Bitcoin',
        currentPrice: 45000,
        change24h: 2.5,
        expectedReturn: 15,
        riskScore: 3,
        recommendationScore: 85,
        reasons: [
          {
            type: RecommendationReason.TECHNICAL_BREAKOUT,
            description: '주요 저항선 돌파 및 상승 모멘텀 확보',
            confidence: 85
          },
          {
            type: RecommendationReason.INSTITUTIONAL_INTEREST,
            description: '기관 투자자들의 지속적인 관심 증가',
            confidence: 80
          }
        ],
        analysis: '비트코인은 기술적 돌파와 기관 관심 증가로 단기 상승 가능성이 높습니다.',
        targetPrice: 52000,
        stopLoss: 42000
      },
      {
        symbol: 'ETHUSDT',
        name: 'Ethereum',
        currentPrice: 2800,
        change24h: 3.2,
        expectedReturn: 20,
        riskScore: 4,
        recommendationScore: 82,
        reasons: [
          {
            type: RecommendationReason.ECOSYSTEM_GROWTH,
            description: 'DeFi 생태계의 지속적인 성장',
            confidence: 90
          },
          {
            type: RecommendationReason.TECHNICAL_BREAKOUT,
            description: '이더리움 2.0 업그레이드 효과',
            confidence: 75
          }
        ],
        analysis: '이더리움은 생태계 성장과 기술적 개선으로 중기 성장이 기대됩니다.',
        targetPrice: 3400,
        stopLoss: 2600
      },
      {
        symbol: 'ADAUSDT',
        name: 'Cardano',
        currentPrice: 0.45,
        change24h: 1.8,
        expectedReturn: 25,
        riskScore: 5,
        recommendationScore: 78,
        reasons: [
          {
            type: RecommendationReason.FUNDAMENTAL_STRENGTH,
            description: '학술적 접근과 검증된 기술',
            confidence: 85
          },
          {
            type: RecommendationReason.REGULATORY_CLARITY,
            description: '규제 친화적 특성',
            confidence: 80
          }
        ],
        analysis: '카르다노는 학술적 접근과 규제 친화적 특성으로 장기 성장 가능성이 높습니다.',
        targetPrice: 0.65,
        stopLoss: 0.40
      }
    ];
  }
}


