/**
 * 메인 애플리케이션 모듈 (Main Application Module)
 * 
 * Crypto Tracker Pro 애플리케이션의 루트 모듈입니다.
 * 
 * 주요 역할:
 * - 모든 하위 모듈들을 통합하여 애플리케이션 구성
 * - 글로벌 설정 및 미들웨어 등록
 * - 의존성 주입 컨테이너 초기화
 * 
 * 포함된 모듈:
 * - ConfigModule: 환경 설정 관리
 * - ThrottlerModule: API 요청 제한 (Rate Limiting)
 * - PresentationModule: HTTP API 엔드포인트
 * 
 * 보안 설정:
 * - API 요청 제한: 1분당 100회, 1시간당 1000회
 * - DDoS 공격 방지 및 서버 리소스 보호
 * 
 * Clean Architecture:
 * - 최상위 모듈로 하위 계층들을 조합
 * - 의존성 방향: Presentation → Application → Domain ← Infrastructure
 */
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './config/database.module';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [
    // 환경 설정 모듈 - 애플리케이션 전체 설정 관리
    ConfigModule,
    
    // 데이터베이스 모듈 - PostgreSQL 연결 및 TypeORM 설정
    DatabaseModule,
    
    // API 요청 제한 모듈 - DDoS 공격 방지 및 서버 리소스 보호
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분 (60초)
        limit: 100, // 1분당 100회 요청 제한 (초당 약 1.67회)
      },
      {
        ttl: 3600000, // 1시간 (3600초)
        limit: 1000, // 1시간당 1000회 요청 제한 (분당 약 16.67회)
      },
    ]),
    
    // 프레젠테이션 모듈 - HTTP API 엔드포인트 제공
    PresentationModule,
  ],
})
export class AppModule {} 