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
 * - MemoryUserRepository: 사용자 데이터 (메모리)
 * 
 * 서비스들:
 * - TechnicalAnalysisService: 기술적 분석 서비스
 * - TranslationService: 번역 서비스
 * - TechnicalIndicatorsService: 기술적 지표 계산
 * - SampleDataService: 샘플 데이터 생성
 * - CoinRecommendationService: AI 코인 추천
 * - AuthService: 인증 서비스
 * - NotificationService: 알림 서비스
 * - DashboardService: 대시보드 서비스
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
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../config/database.module';

// Binance API 관련
import { BinanceApiRepository } from './repositories/market/binance-api.repository';

// AI 관련
import { GoogleAiRepository } from './repositories/ai/google-ai.repository';

// 가격 관련
import { MemoryPriceRepository } from './repositories/price/memory-price.repository';

// 환율 관련
import { ExchangeRateApiRepository } from './repositories/market/exchange-rate-api.repository';

// 뉴스 관련
import { NewsCrawlerRepository } from './repositories/news/news-crawler.repository';

// 차트 관련
import { MemoryOHLCVRepository } from './repositories/chart/memory-chart.repository';

// 스트리밍 관련
import { BinanceStreamingRepository } from './streaming/binance-streaming.repository';

// 서비스들
import { TranslationService } from './services/utility/translation.service';
import { TechnicalAnalysisService } from './services/technical-analysis/technical-analysis.service';
import { TechnicalIndicatorsService } from './services/technical-analysis/technical-indicators.service';
import { CoinRecommendationService } from './services/recommendation/coin-recommendation.service';
import { SampleDataService } from './services/utility/sample-data.service';

// 사용자 관련 리포지토리
import { PostgresUserRepository } from './repositories/user/postgres-user.repository';
import { PostgresNotificationRepository } from './repositories/notification/postgres-notification.repository';
import { PostgresDashboardRepository } from './repositories/dashboard/postgres-dashboard.repository';

// 서비스들
import { AuthService } from './services/auth/auth.service';
import { NotificationService } from './services/notification/notification.service';
import { DashboardService } from './services/dashboard/dashboard.service';

// 리스너들
import { PriceUpdatedListener } from './listeners/price-updated.listener';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    // Binance API 관련 Provider들
    {
      provide: 'BinanceRepository',
      useClass: BinanceApiRepository,
    },

    // AI 관련 Provider들
    {
      provide: 'AiRepository',
      useClass: GoogleAiRepository,
    },

    // 가격 관련 Provider들
    {
      provide: 'PriceRepository',
      useClass: MemoryPriceRepository,
    },

    // 환율 관련 Provider들
    {
      provide: 'ExchangeRateRepository',
      useClass: ExchangeRateApiRepository,
    },

    // 뉴스 관련 Provider들
    {
      provide: 'NewsRepository',
      useClass: NewsCrawlerRepository,
    },

    // 차트 관련 Provider들
    {
      provide: 'ChartRepository',
      useClass: MemoryOHLCVRepository,
    },
    {
      provide: 'OHLCVRepository',
      useClass: MemoryOHLCVRepository,
    },
    {
      provide: 'TechnicalIndicatorRepository',
      useClass: MemoryOHLCVRepository,
    },
    {
      provide: 'DrawingRepository',
      useClass: MemoryOHLCVRepository,
    },
    {
      provide: 'ChartSettingsRepository',
      useClass: MemoryOHLCVRepository,
    },

    // 스트리밍 관련 Provider들
    {
      provide: 'BinanceStreamingRepository',
      useClass: BinanceStreamingRepository,
    },

    // 사용자 관련 리포지토리 Provider들
    {
      provide: 'UserRepository',
      useClass: PostgresUserRepository,
    },
    {
      provide: 'NotificationRepository',
      useClass: PostgresNotificationRepository,
    },
    {
      provide: 'DashboardRepository',
      useClass: PostgresDashboardRepository,
    },

    // 서비스 Provider들
    TranslationService,
    TechnicalAnalysisService,
    TechnicalIndicatorsService,
    CoinRecommendationService,
    SampleDataService,
    AuthService,
    NotificationService,
    DashboardService,

    // 리스너 Provider들
    PriceUpdatedListener,
  ],
  exports: [
    // Binance API 관련 Provider들
    'BinanceRepository',

    // AI 관련 Provider들
    'AiRepository',

    // 가격 관련 Provider들
    'PriceRepository',

    // 환율 관련 Provider들
    'ExchangeRateRepository',

    // 뉴스 관련 Provider들
    'NewsRepository',

    // 차트 관련 Provider들
    'ChartRepository',
    'OHLCVRepository',
    'TechnicalIndicatorRepository',
    'DrawingRepository',
    'ChartSettingsRepository',

    // 스트리밍 관련 Provider들
    'BinanceStreamingRepository',

    // 사용자 관련 리포지토리 Provider들
    'UserRepository',
    'NotificationRepository',
    'DashboardRepository',

    // 서비스 Provider들
    TranslationService,
    TechnicalAnalysisService,
    TechnicalIndicatorsService,
    CoinRecommendationService,
    SampleDataService,
    AuthService,
    NotificationService,
    DashboardService,
  ],
})
export class InfrastructureModule {} 