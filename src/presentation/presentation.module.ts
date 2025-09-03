/**
 * 프레젠테이션 모듈 (Presentation Module)
 * 
 * HTTP API 엔드포인트를 제공하는 프레젠테이션 계층의 모듈입니다.
 * 
 * 주요 역할:
 * - REST API 컨트롤러들을 등록 및 관리
 * - HTTP 요청/응답 처리
 * - API 문서화 (Swagger)
 * - 요청 검증 및 에러 처리
 * 
 * 포함된 컨트롤러:
 * - PriceController: 실시간 가격 조회 API
 * - PredictionController: AI 가격 예측 API
 * - AiController: AI 기술적 분석 API
 * - ChartController: 고급 차트 기능 API
 * - RecommendationController: AI 코인 추천 API
 * - StreamController: WebSocket 스트리밍 API
 * - SymbolsController: 거래 가능한 코인 목록 API
 * - NewsController: 암호화폐 뉴스 API
 * - MarketController: 시장 통계 API
 * - TcpController: 시스템 상태 관리 API
 * - AuthController: 사용자 인증 API
 * - NotificationController: 알림 관리 API
 * - DashboardController: 대시보드 관리 API
 * 
 * 의존성:
 * - ApplicationModule: 비즈니스 로직 (Use Cases)
 * - InfrastructureModule: 데이터 접근 (Repositories)
 * - StreamingModule: 실시간 데이터 스트리밍
 * 
 * Clean Architecture:
 * - Presentation Layer에 위치
 * - Application Layer의 Use Cases에만 의존
 * - 비즈니스 로직은 직접 포함하지 않음
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PriceController } from './controllers/price';
import { PredictionController } from './controllers/prediction';
import { AiController } from './controllers/ai';
import { TcpController, StreamController } from './controllers/stream';
import { SymbolsController, MarketController } from './controllers/market';
import { NewsController } from './controllers/news';
import { ChartController } from './controllers/chart';
import { RecommendationController } from './controllers/recommendation';
import { AuthController } from './controllers/auth';
import { NotificationController } from './controllers/notification';
import { DashboardController } from './controllers/dashboard';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { StreamingModule } from '../infrastructure/streaming/streaming.module';

@Module({
  imports: [
    // JWT 모듈 설정
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    
    // Passport 모듈
    PassportModule,
    
    // 비즈니스 로직 모듈 - Use Cases 제공
    ApplicationModule,
    
    // 데이터 접근 모듈 - Repositories 및 Services 제공
    InfrastructureModule,
    
    // 실시간 스트리밍 모듈 - WebSocket 기능 제공
    StreamingModule,
  ],
  controllers: [
    // 실시간 가격 조회 API
    PriceController,
    
    // AI 가격 예측 API
    PredictionController,
    
    // AI 기술적 분석 API
    AiController,
    
    // 시스템 상태 관리 API
    TcpController,
    
    // WebSocket 스트리밍 API
    StreamController,
    
    // 거래 가능한 코인 목록 API
    SymbolsController,
    
    // 암호화폐 뉴스 API
    NewsController,
    
    // 시장 통계 API
    MarketController,
    
    // 고급 차트 기능 API
    ChartController,
    
    // AI 코인 추천 API
    RecommendationController,
    
    // 사용자 인증 API
    AuthController,
    
    // 알림 관리 API
    NotificationController,
    
    // 대시보드 관리 API
    DashboardController,
  ],
})
export class PresentationModule {} 