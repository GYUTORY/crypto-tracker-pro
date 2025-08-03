/**
 * 인프라스트럭처 모듈
 * 
 * 이 모듈은 Clean Architecture의 Infrastructure Layer를 구성합니다.
 * 
 * 주요 역할:
 * - 외부 시스템과의 실제 통신 구현
 * - Domain Layer의 Repository 인터페이스 구현
 * - 데이터베이스, API, 외부 서비스 연동
 * 
 * 포함된 컴포넌트:
 * - Repository 구현체들 (BinanceApiRepository, GoogleAiRepository, MemoryPriceRepository)
 * - 외부 서비스 연동 서비스들 (TechnicalAnalysisService)
 * 
 * 의존성 주입 설정:
 * - 문자열 토큰을 사용한 Provider 등록
 * - Clean Architecture에서 의존성 역전 원칙 구현
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { BinanceApiRepository } from './repositories/binance-api.repository';
import { GoogleAiRepository } from './repositories/google-ai.repository';
import { MemoryPriceRepository } from './repositories/memory-price.repository';
import { TechnicalAnalysisService } from './services/technical-analysis.service';

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
    // 기술적 분석 서비스
    TechnicalAnalysisService
  ],
  exports: [
    // 다른 모듈에서 사용할 수 있도록 Provider들 내보내기
    'BinanceRepository',
    'AiRepository',
    'PriceRepository',
    TechnicalAnalysisService
  ],
})
export class InfrastructureModule {} 