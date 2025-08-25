/**
 * 인프라스트럭처 모듈 (Infrastructure Module)
 * 
 * Clean Architecture의 Infrastructure Layer를 구성하는 모듈입니다.
 * 
 * 주요 역할:
 * - 외부 시스템과의 실제 통신 구현
 * - Domain Layer의 Repository 인터페이스 구현
 * - 데이터베이스, API, 외부 서비스 연동
 * - 캐싱, 로깅, 보안 등 인프라스트럭처 관심사 처리
 * 
 * 포함된 컴포넌트:
 * 
 * Repository 구현체들:
 * - BinanceApiRepository: 바이낸스 API 연동
 * - GoogleAiRepository: Google Gemini AI 연동
 * - MemoryPriceRepository: 인메모리 가격 캐시
 * - ExchangeRateApiRepository: 환율 API 연동
 * - NewsCrawlerRepository: 뉴스 크롤링
 * - MemoryOHLCVRepository: OHLCV 데이터 캐시
 * - MemoryTechnicalIndicatorRepository: 기술적 지표 캐시
 * - MemoryDrawingRepository: 드로잉 데이터 캐시
 * - MemoryChartSettingsRepository: 차트 설정 캐시
 * 
 * 서비스들:
 * - TechnicalAnalysisService: 기술적 분석 서비스
 * - TranslationService: 번역 서비스
 * - TechnicalIndicatorsService: 기술적 지표 계산
 * - SampleDataService: 샘플 데이터 생성
 * - CoinRecommendationService: AI 코인 추천
 * 
 * 의존성 주입 설정:
 * - 문자열 토큰을 사용한 Provider 등록
 * - Clean Architecture에서 의존성 역전 원칙 구현
 * - Interface와 Implementation 분리
 * 
 * Clean Architecture:
 * - Infrastructure Layer에 위치
 * - Domain Layer의 Repository 인터페이스 구현
 * - 외부 시스템과의 실제 통신 담당
 * - 비즈니스 로직은 포함하지 않음
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { BinanceApiRepository } from './repositories/binance-api.repository';
import { GoogleAiRepository } from './repositories/google-ai.repository';
import { MemoryPriceRepository } from './repositories/memory-price.repository';
import { ExchangeRateApiRepository } from './repositories/exchange-rate-api.repository';
import { NewsCrawlerRepository } from './repositories/news-crawler.repository';
import { TechnicalAnalysisService } from './services/technical-analysis.service';
import { TranslationService } from './services/translation.service';
import { TechnicalIndicatorsService } from './services/technical-indicators.service';
import { SampleDataService } from './services/sample-data.service';
import { CoinRecommendationService } from './services/coin-recommendation.service';
import { MemoryOHLCVRepository } from './repositories/memory-chart.repository';
import { MemoryTechnicalIndicatorRepository } from './repositories/memory-chart.repository';
import { MemoryDrawingRepository } from './repositories/memory-chart.repository';
import { MemoryChartSettingsRepository } from './repositories/memory-chart.repository';

@Module({
  imports: [ConfigModule], // 설정 모듈 의존성
  providers: [
    // 바이낸스 API Repository Provider
    // 'BinanceRepository' 토큰으로 BinanceApiRepository 인스턴스 제공
    {
      provide: 'BinanceRepository',
      useClass: BinanceApiRepository,
    },
    // AI Repository Provider
    // 'AiRepository' 토큰으로 GoogleAiRepository 인스턴스 제공
    {
      provide: 'AiRepository',
      useClass: GoogleAiRepository,
    },
    // 가격 데이터 Repository Provider
    // 'PriceRepository' 토큰으로 MemoryPriceRepository 인스턴스 제공
    {
      provide: 'PriceRepository',
      useClass: MemoryPriceRepository,
    },
    // 환율 API Repository Provider
    // 'ExchangeRateRepository' 토큰으로 ExchangeRateApiRepository 인스턴스 제공
    {
      provide: 'ExchangeRateRepository',
      useClass: ExchangeRateApiRepository,
    },
    // 뉴스 Repository Provider
    // 'NewsRepository' 토큰으로 NewsCrawlerRepository 인스턴스 제공
    {
      provide: 'NewsRepository',
      useClass: NewsCrawlerRepository,
    },
    // 번역 서비스
    TranslationService,
    // 기술적 분석 서비스
    TechnicalAnalysisService,
    // 차트 관련 서비스들
    TechnicalIndicatorsService,
    SampleDataService,
    // AI 코인 추천 서비스
    CoinRecommendationService,
    // 차트 관련 Repository들
    {
      provide: 'OHLCVRepository',
      useClass: MemoryOHLCVRepository,
    },
    {
      provide: 'TechnicalIndicatorRepository',
      useClass: MemoryTechnicalIndicatorRepository,
    },
    {
      provide: 'DrawingRepository',
      useClass: MemoryDrawingRepository,
    },
    {
      provide: 'ChartSettingsRepository',
      useClass: MemoryChartSettingsRepository,
    }
  ],
  exports: [
    // 다른 모듈에서 사용할 수 있도록 Provider들 내보내기
    'BinanceRepository',
    'AiRepository',
    'PriceRepository',
    'ExchangeRateRepository',
    'NewsRepository',
    TranslationService,
    TechnicalAnalysisService,
    // 차트 관련 Provider들
    'OHLCVRepository',
    'TechnicalIndicatorRepository',
    'DrawingRepository',
    'ChartSettingsRepository',
    TechnicalIndicatorsService,
    SampleDataService,
    CoinRecommendationService
  ],
})
export class InfrastructureModule {} 