/**
 * main.ts - 애플리케이션 진입점
 * 
 * 이 파일은 NestJS 애플리케이션의 시작점입니다.
 * 애플리케이션을 초기화하고 서버를 시작하는 역할을 합니다.
 * 
 * 주요 기능:
 * - NestJS 애플리케이션 인스턴스 생성
 * - 미들웨어 설정
 * - 글로벌 파이프 설정
 * - CORS 설정
 * - 서버 포트 설정 및 시작
 * 
 * 실행 순서:
 * 1. NestFactory.create()로 애플리케이션 인스턴스 생성
 * 2. 미들웨어 및 글로벌 설정 적용
 * 3. app.listen()으로 HTTP 서버 시작
 * 4. WebSocket 서버도 자동으로 시작됨
 * 
 * 환경 변수:
 * - PORT: 서버 포트 (기본값: 3000)
 * - NODE_ENV: 실행 환경 (development, production)
 * 
 * 개발 모드 실행:
 * npm run start:dev
 * 
 * 프로덕션 모드 실행:
 * npm run start:prod
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // NestJS 애플리케이션 인스턴스 생성
  // AppModule을 루트 모듈로 사용하여 애플리케이션을 구성
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 (Cross-Origin Resource Sharing)
  // 클라이언트와 서버가 다른 도메인에서 실행될 때 필요
  app.enableCors({
    origin: true, // 개발 환경에서는 모든 도메인 허용
    credentials: true, // 쿠키 및 인증 헤더 허용
  });
  
  // 글로벌 프리픽스 설정 (제거됨)
  // 모든 API 엔드포인트가 루트 경로에서 직접 접근 가능
  // app.setGlobalPrefix('api');
  
  // 서버 시작
  // 기본 포트 3000에서 HTTP 서버 시작
  // WebSocket 서버도 자동으로 시작됨
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Crypto Tracker Pro is running on: http://localhost:${port}`);
  console.log(`📡 Connecting to Binance WebSocket stream...`);
  console.log(`🔗 API endpoints are available on: http://localhost:${port}`);
}

// 애플리케이션 시작
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 