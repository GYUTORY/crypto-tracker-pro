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
import { AiRepository } from '../../../domain/repositories/ai';
import { BinanceRepository } from '../../../domain/repositories/market';
import { NewsRepository } from '../../../domain/repositories/news';
import { 
  TimeframeType, 
  RecommendationReason,
  RecommendedCoinDto, 
  RecommendationReasonDto,
  CoinRecommendationResponseDto,
  AllRecommendationsResponseDto
} from '../../../shared/dto/recommendation';
import Logger from '../../../shared/logger';

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
    try {
      // 1. 현재 날짜와 시간 정보 수집
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString();
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()];
      
      // 2. 실시간 시장 데이터 수집
      const marketData = await this.getCurrentMarketData();
      
      // 3. 최신 뉴스 데이터 수집
      const recentNews = await this.getRecentNews();
      
      // 4. 기술적 지표 데이터 수집
      const technicalIndicators = await this.getTechnicalIndicators();

      const prompt = `
현재 시점: ${currentDateString} (${dayOfWeek}요일)

=== 현재 시장 상황 ===
${marketData}

=== 최신 뉴스 및 이벤트 ===
${recentNews}

=== 주요 기술적 지표 ===
${technicalIndicators}

다음은 단기 투자(1-7일)를 위한 암호화폐 추천 요청입니다.

위의 실시간 데이터를 기반으로 현재 시장 상황을 정확히 분석하고, 
기술적 지표, 뉴스, 시장 심리 등을 종합적으로 고려하여 
단기적으로 상승 가능성이 높은 TOP 3 코인을 추천해주세요.

분석 시 고려사항:
1. 현재 시장의 전반적인 트렌드와 변동성
2. 최신 뉴스와 이벤트가 시장에 미치는 영향
3. 기술적 지표의 신호 (RSI, MACD, 볼린저 밴드 등)
4. 거래량과 모멘텀 지표
5. 단기적 지지/저항선 돌파 가능성

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
        generatedAt: currentDateString,
        modelInfo: 'Gemini 1.5 Pro - Real-time Technical Analysis & Market Sentiment',
        marketAnalysis: this.generateMarketAnalysis(marketData, 'short')
      };
    } catch (error) {
      Logger.error('단기 추천 생성 실패:', error);
      return this.generateFallbackRecommendations(TimeframeType.SHORT_TERM);
    }
  }

  /**
   * 중기 추천 코인 생성 (1-4주)
   */
  async generateMediumTermRecommendations(): Promise<CoinRecommendationResponseDto> {
    try {
      // 1. 현재 날짜와 시간 정보 수집
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString();
      
      // 2. 실시간 시장 데이터 수집
      const marketData = await this.getCurrentMarketData();
      
      // 3. 최신 뉴스 데이터 수집
      const recentNews = await this.getRecentNews();
      
      // 4. 기본적 분석 데이터 수집
      const fundamentalData = await this.getFundamentalData();

      const prompt = `
현재 시점: ${currentDateString}

=== 현재 시장 상황 ===
${marketData}

=== 최신 뉴스 및 이벤트 ===
${recentNews}

=== 기본적 분석 데이터 ===
${fundamentalData}

다음은 중기 투자(1-4주)를 위한 암호화폐 추천 요청입니다.

위의 실시간 데이터를 기반으로 현재 시장 상황을 정확히 분석하고,
기본적 분석, 기술적 분석, 시장 트렌드, 기관 투자자 관심도 등을 종합적으로 고려하여 
중기적으로 성장 가능성이 높은 TOP 3 코인을 추천해주세요.

분석 시 고려사항:
1. 프로젝트의 개발 진행 상황과 업데이트
2. 생태계 성장과 파트너십 확대
3. 기관 투자자들의 관심도 변화
4. 시장 심리와 소셜 미디어 감정
5. 중기적 기술적 트렌드

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
        generatedAt: currentDateString,
        modelInfo: 'Gemini 1.5 Pro - Real-time Fundamental & Technical Analysis',
        marketAnalysis: this.generateMarketAnalysis(marketData, 'medium')
      };
    } catch (error) {
      Logger.error('중기 추천 생성 실패:', error);
      return this.generateFallbackRecommendations(TimeframeType.MEDIUM_TERM);
    }
  }

  /**
   * 장기 추천 코인 생성 (1-12개월)
   */
  async generateLongTermRecommendations(): Promise<CoinRecommendationResponseDto> {
    try {
      // 1. 현재 날짜와 시간 정보 수집
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString();
      
      // 2. 실시간 시장 데이터 수집
      const marketData = await this.getCurrentMarketData();
      
      // 3. 최신 뉴스 데이터 수집
      const recentNews = await this.getRecentNews();
      
      // 4. 장기적 분석 데이터 수집
      const longTermData = await this.getLongTermData();

      const prompt = `
현재 시점: ${currentDateString}

=== 현재 시장 상황 ===
${marketData}

=== 최신 뉴스 및 이벤트 ===
${recentNews}

=== 장기적 분석 데이터 ===
${longTermData}

다음은 장기 투자(1-12개월)를 위한 암호화폐 추천 요청입니다.

위의 실시간 데이터를 기반으로 현재 시장 상황을 정확히 분석하고,
기본적 분석, 생태계 성장성, 규제 환경, 기술 혁신, 기관 채택 등을 종합적으로 고려하여 
장기적으로 가치가 크게 상승할 가능성이 높은 TOP 3 코인을 추천해주세요.

분석 시 고려사항:
1. 프로젝트의 장기적 비전과 로드맵
2. 기술적 혁신과 경쟁 우위
3. 규제 환경 변화와 적응력
4. 기관 투자자들의 장기적 관심
5. 생태계 확장 가능성

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
        generatedAt: currentDateString,
        modelInfo: 'Gemini 1.5 Pro - Real-time Fundamental & Ecosystem Analysis',
        marketAnalysis: this.generateMarketAnalysis(marketData, 'long')
      };
    } catch (error) {
      Logger.error('장기 추천 생성 실패:', error);
      return this.generateFallbackRecommendations(TimeframeType.LONG_TERM);
    }
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

  /**
   * 현재 시장 데이터 수집
   */
  private async getCurrentMarketData(): Promise<string> {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
      const marketData = [];

      for (const symbol of symbols) {
        try {
          const price = await this.binanceRepository.getSymbolPrice(symbol);
          const stats = await this.binanceRepository.get24hrStats(symbol);
          
          marketData.push(`${symbol}: $${price} (24h: ${stats.change}, 거래량: ${stats.volume24h})`);
        } catch (error) {
          Logger.warn(`${symbol} 시장 데이터 수집 실패:`, error);
        }
      }

      return marketData.length > 0 
        ? `주요 코인 현재 가격:\n${marketData.join('\n')}`
        : '시장 데이터 수집 중 오류 발생';
    } catch (error) {
      Logger.error('시장 데이터 수집 실패:', error);
      return '시장 데이터 수집 중 오류 발생';
    }
  }

  /**
   * 최신 뉴스 데이터 수집
   */
  private async getRecentNews(): Promise<string> {
    try {
      const news = await this.newsRepository.crawlBitcoinNews(); // 최근 뉴스 크롤링
      if (news && news.length > 0) {
        const recentNews = news.slice(0, 5); // 최근 5개 뉴스
        const newsSummaries = recentNews.map((item, index) => 
          `${index + 1}. ${item.title} (${item.publishedAt})`
        );
        return `최신 뉴스:\n${newsSummaries.join('\n')}`;
      }
      return '최신 뉴스 데이터 없음';
    } catch (error) {
      Logger.error('뉴스 데이터 수집 실패:', error);
      return '뉴스 데이터 수집 중 오류 발생';
    }
  }

  /**
   * 기술적 지표 데이터 수집
   */
  private async getTechnicalIndicators(): Promise<string> {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      const indicators = [];

      for (const symbol of symbols) {
        try {
          const technicalData = await this.binanceRepository.getTechnicalData(symbol);
          
          // RSI 상태 판단
          let rsiStatus = '중립';
          if (technicalData.rsi > 70) rsiStatus = '과매수';
          else if (technicalData.rsi < 30) rsiStatus = '과매도';
          
          // MACD 신호 판단
          let macdSignal = '중립';
          if (technicalData.macd > technicalData.macdSignal) macdSignal = '상승';
          else if (technicalData.macd < technicalData.macdSignal) macdSignal = '하락';
          
          // 볼린저 밴드 위치 판단
          const currentPrice = await this.binanceRepository.getSymbolPrice(symbol);
          const price = parseFloat(currentPrice);
          const upper = parseFloat(technicalData.bollingerUpper);
          const lower = parseFloat(technicalData.bollingerLower);
          
          let bbPosition = '중간';
          if (price >= upper) bbPosition = '상단';
          else if (price <= lower) bbPosition = '하단';
          
          indicators.push(`${symbol} - RSI: ${technicalData.rsi.toFixed(1)} (${rsiStatus}), MACD: ${macdSignal} 신호, BB: ${bbPosition} 밴드`);
        } catch (error) {
          Logger.warn(`${symbol} 기술적 지표 수집 실패:`, error);
          // 개별 심볼 실패 시 기본 정보 제공
          indicators.push(`${symbol} - 기술적 지표 수집 실패`);
        }
      }

      return indicators.length > 0 
        ? `기술적 지표:\n${indicators.join('\n')}`
        : '기술적 지표 데이터 수집 중 오류 발생';
    } catch (error) {
      Logger.error('기술적 지표 수집 실패:', error);
      return '기술적 지표 데이터 수집 중 오류 발생';
    }
  }

  /**
   * 기본적 분석 데이터 수집
   */
  private async getFundamentalData(): Promise<string> {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
      const fundamentalData = [];

      for (const symbol of symbols) {
        try {
          const stats = await this.binanceRepository.get24hrStats(symbol);
          const price = await this.binanceRepository.getSymbolPrice(symbol);
          
          // 거래량과 변동성을 기반으로 기본적 분석
          const volume = parseFloat(stats.volume);
          const changePercent = parseFloat(stats.changePercent);
          
          let analysis = '';
          if (volume > 1000000) { // 거래량이 100만 이상
            analysis = '높은 거래량으로 시장 관심 집중';
          } else if (Math.abs(changePercent) > 5) {
            analysis = '높은 변동성으로 단기 기회 존재';
          } else {
            analysis = '안정적인 거래 패턴';
          }
          
          fundamentalData.push(`${symbol}: ${analysis} (거래량: ${stats.volume24h}, 변동률: ${stats.change})`);
        } catch (error) {
          Logger.warn(`${symbol} 기본적 분석 데이터 수집 실패:`, error);
        }
      }

      return fundamentalData.length > 0 
        ? `기본적 분석:\n${fundamentalData.join('\n')}`
        : '기본적 분석 데이터 수집 중 오류 발생';
    } catch (error) {
      Logger.error('기본적 분석 데이터 수집 실패:', error);
      return '기본적 분석 데이터 수집 중 오류 발생';
    }
  }

  /**
   * 장기적 분석 데이터 수집
   */
  private async getLongTermData(): Promise<string> {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
      const longTermData = [];

      for (const symbol of symbols) {
        try {
          // 장기적 데이터를 위해 더 긴 기간의 차트 데이터 조회
          const chartData = await this.binanceRepository.getChartData(symbol, '1d', 30);
          const stats = await this.binanceRepository.get24hrStats(symbol);
          
          // 30일 데이터를 기반으로 장기 트렌드 분석
          const prices = chartData.data.map((item: any) => parseFloat(item.price));
          const firstPrice = prices[0];
          const lastPrice = prices[prices.length - 1];
          const longTermChange = ((lastPrice - firstPrice) / firstPrice) * 100;
          
          let trend = '';
          if (longTermChange > 10) {
            trend = '강한 상승 트렌드';
          } else if (longTermChange > 0) {
            trend = '약한 상승 트렌드';
          } else if (longTermChange > -10) {
            trend = '약한 하락 트렌드';
          } else {
            trend = '강한 하락 트렌드';
          }
          
          longTermData.push(`${symbol}: ${trend} (30일 변화: ${longTermChange.toFixed(2)}%)`);
        } catch (error) {
          Logger.warn(`${symbol} 장기적 분석 데이터 수집 실패:`, error);
        }
      }

      return longTermData.length > 0 
        ? `장기적 분석:\n${longTermData.join('\n')}`
        : '장기적 분석 데이터 수집 중 오류 발생';
    } catch (error) {
      Logger.error('장기적 분석 데이터 수집 실패:', error);
      return '장기적 분석 데이터 수집 중 오류 발생';
    }
  }

  /**
   * 시장 분석 생성
   */
  private generateMarketAnalysis(marketData: string, timeframe: string): string {
    const analyses = {
      short: '단기 시장은 기술적 돌파와 뉴스 이벤트에 민감하게 반응하고 있습니다.',
      medium: '중기 시장은 기본적 요인과 기술적 트렌드의 조합으로 움직입니다.',
      long: '장기 시장은 생태계 성장과 기술 혁신이 핵심 동력입니다.'
    };
    return analyses[timeframe] || '시장 분석 데이터를 생성할 수 없습니다.';
  }

  /**
   * 폴백 추천 생성 (오류 시)
   */
  private generateFallbackRecommendations(timeframe: TimeframeType): CoinRecommendationResponseDto {
    const recommendations = this.generateSampleRecommendations();
    
    return {
      timeframe,
      timeframeDescription: this.getTimeframeDescription(timeframe),
      recommendations: recommendations.slice(0, 3),
      generatedAt: new Date().toISOString(),
      modelInfo: 'Fallback - Sample Data (AI 분석 실패)',
      marketAnalysis: 'AI 분석 중 오류가 발생하여 샘플 데이터를 제공합니다.'
    };
  }

  /**
   * 타임프레임 설명 가져오기
   */
  private getTimeframeDescription(timeframe: TimeframeType): string {
    const descriptions = {
      [TimeframeType.SHORT_TERM]: '단기 투자 (1-7일)',
      [TimeframeType.MEDIUM_TERM]: '중기 투자 (1-4주)',
      [TimeframeType.LONG_TERM]: '장기 투자 (1-12개월)'
    };
    return descriptions[timeframe] || '투자 기간 미정';
  }
}


