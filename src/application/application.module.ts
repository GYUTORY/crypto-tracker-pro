/**
 * 애플리케이션 모듈 (Application Module)
 * 
 * 비즈니스 로직을 담당하는 애플리케이션 계층의 모듈입니다.
 * 
 * 주요 역할:
 * - Use Cases (유스케이스) 등록 및 관리
 * - 비즈니스 로직 조합 및 조율
 * - 도메인 객체와 인프라스트럭처 간의 중재
 * - 트랜잭션 경계 관리
 * 
 * 포함된 Use Cases:
 * - 가격 관련: GetPriceUseCase, GetChartDataUseCase
 * - AI 분석: AnalyzeTechnicalUseCase, AnalyzeTechnicalSimpleUseCase
 * - 예측: PredictPriceUseCase
 * - 차트 기능: GetOHLCVDataUseCase, GetRSIIndicatorUseCase 등
 * - 드로잉: CreateDrawingUseCase, GetDrawingsUseCase
 * - 추천: GetShortTermRecommendationsUseCase 등
 * - 기타: GetTradingSymbolsUseCase, GetBitcoinNewsUseCase, GetMarketStatsUseCase
 * 
 * 의존성:
 * - InfrastructureModule: 데이터 접근을 위한 Repository 구현체들
 * 
 * Clean Architecture:
 * - Application Layer에 위치
 * - Domain Layer의 Repository 인터페이스에 의존
 * - Infrastructure Layer의 구체적 구현체는 DI를 통해 주입
 * - 비즈니스 규칙과 워크플로우 정의
 */
import { Module } from '@nestjs/common';
import { GetPriceUseCase } from './use-cases/get-price.use-case';
import { PredictPriceUseCase } from './use-cases/predict-price.use-case';
import { AnalyzeTechnicalUseCase } from './use-cases/analyze-technical.use-case';
import { AnalyzeTechnicalSimpleUseCase } from './use-cases/analyze-technical-simple.use-case';
import { GetTradingSymbolsUseCase } from './use-cases/get-trading-symbols.use-case';
import { GetBitcoinNewsUseCase } from './use-cases/get-bitcoin-news.use-case';
import { GetChartDataUseCase } from './use-cases/get-chart-data.use-case';
import { GetMarketStatsUseCase } from './use-cases/get-market-stats.use-case';
import { GetOHLCVDataUseCase } from './use-cases/get-ohlcv-data.use-case';
import { GetRSIIndicatorUseCase } from './use-cases/get-rsi-indicator.use-case';
import { GetMACDIndicatorUseCase } from './use-cases/get-macd-indicator.use-case';
import { GetBollingerBandsIndicatorUseCase } from './use-cases/get-bollinger-bands-indicator.use-case';
import { GetMovingAverageIndicatorUseCase } from './use-cases/get-moving-average-indicator.use-case';
import { CreateDrawingUseCase } from './use-cases/create-drawing.use-case';
import { GetDrawingsUseCase } from './use-cases/get-drawings.use-case';
import { GetShortTermRecommendationsUseCase } from './use-cases/get-short-term-recommendations.use-case';
import { GetMediumTermRecommendationsUseCase } from './use-cases/get-medium-term-recommendations.use-case';
import { GetLongTermRecommendationsUseCase } from './use-cases/get-long-term-recommendations.use-case';
import { GetAllRecommendationsUseCase } from './use-cases/get-all-recommendations.use-case';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    // 인프라스트럭처 모듈 - Repository 구현체들 제공
    InfrastructureModule,
  ],
  providers: [
    // 가격 관련 Use Cases
    GetPriceUseCase,                    // 실시간 가격 조회
    GetChartDataUseCase,                // 차트 데이터 조회
    
    // AI 분석 Use Cases
    AnalyzeTechnicalUseCase,            // 상세 기술적 분석
    AnalyzeTechnicalSimpleUseCase,      // 간단한 기술적 분석
    PredictPriceUseCase,                // 가격 예측
    
    // 차트 기능 Use Cases
    GetOHLCVDataUseCase,                // OHLCV 데이터 조회
    GetRSIIndicatorUseCase,             // RSI 지표 계산
    GetMACDIndicatorUseCase,            // MACD 지표 계산
    GetBollingerBandsIndicatorUseCase,  // 볼린저 밴드 계산
    GetMovingAverageIndicatorUseCase,   // 이동평균선 계산
    
    // 드로잉 기능 Use Cases
    CreateDrawingUseCase,               // 드로잉 생성
    GetDrawingsUseCase,                 // 드로잉 조회
    
    // AI 추천 Use Cases
    GetShortTermRecommendationsUseCase,  // 단기 추천
    GetMediumTermRecommendationsUseCase, // 중기 추천
    GetLongTermRecommendationsUseCase,   // 장기 추천
    GetAllRecommendationsUseCase,        // 전체 추천
    
    // 기타 Use Cases
    GetTradingSymbolsUseCase,           // 거래 가능한 코인 목록
    GetBitcoinNewsUseCase,              // 비트코인 뉴스
    GetMarketStatsUseCase,              // 시장 통계
  ],
  exports: [
    // Presentation Layer에서 사용할 수 있도록 모든 Use Cases 내보내기
    GetPriceUseCase,
    GetChartDataUseCase,
    AnalyzeTechnicalUseCase,
    AnalyzeTechnicalSimpleUseCase,
    PredictPriceUseCase,
    GetOHLCVDataUseCase,
    GetRSIIndicatorUseCase,
    GetMACDIndicatorUseCase,
    GetBollingerBandsIndicatorUseCase,
    GetMovingAverageIndicatorUseCase,
    CreateDrawingUseCase,
    GetDrawingsUseCase,
    GetShortTermRecommendationsUseCase,
    GetMediumTermRecommendationsUseCase,
    GetLongTermRecommendationsUseCase,
    GetAllRecommendationsUseCase,
    GetTradingSymbolsUseCase,
    GetBitcoinNewsUseCase,
    GetMarketStatsUseCase,
  ],
})
export class ApplicationModule {} 