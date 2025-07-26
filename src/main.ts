/**
 * NestJS 애플리케이션 진입점
 * 
 * NestFactory.create() - NestJS 앱 인스턴스 생성
 * app.enableCors() - CORS 설정 (브라우저 보안 정책)
 * DocumentBuilder - Swagger 문서 설정 빌더
 * SwaggerModule.setup() - Swagger UI 엔드포인트 설정
 * app.listen() - HTTP 서버 시작
 */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import Logger from './Logger';

async function bootstrap() {
  // NestFactory.create() - AppModule을 루트로 앱 인스턴스 생성
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 - 브라우저에서 다른 도메인 API 호출 허용
  app.enableCors({
    origin: true, // 모든 도메인 허용 (개발용)
    credentials: true, // 쿠키/인증 헤더 허용
  });
  
  // DocumentBuilder - Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('Crypto Tracker Pro API')
    .setDescription(`
      Crypto Tracker Pro - 실시간 암호화폐 가격 추적 API

      주요 기능:
      - 실시간 가격 데이터: 바이낸스 WebSocket을 통한 실시간 비트코인/이더리움 가격 수신
      - 메모리 기반 저장소: 빠른 가격 데이터 조회 (30초 유효성)
      - 폴백 시스템: 메모리에 없으면 바이낸스 API 자동 호출
      - 통일된 응답 형식: 모든 API가 BaseResponse 형태로 응답

      데이터 흐름:
      1. 바이낸스 WebSocket → WebSocket 클라이언트 → 메모리 저장소
      2. API 요청 → 메모리 조회 → BaseResponse 형태로 응답
      3. 메모리에 없으면 → 바이낸스 API 호출 → 메모리 저장 → 응답
    `)
    .setVersion('1.0.0')
    .addTag('health', '헬스체크 및 기본 정보')
    .addTag('binance', '바이낸스 가격 데이터 API')
    .addTag('tcp', 'WebSocket 연결 상태 및 메모리 데이터')
    .addServer('http://localhost:3000', '개발 서버')
    .build();

  // SwaggerModule.createDocument() - 앱과 설정으로 문서 생성
  const document = SwaggerModule.createDocument(app, config);
  
  // SwaggerModule.setup() - Swagger UI 엔드포인트 설정
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Crypto Tracker Pro API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    `,
  });

  // app.setGlobalPrefix('api') - 글로벌 경로 프리픽스 (현재 미사용)
  const port = process.env.PORT || 3000;
  
  // app.listen() - HTTP 서버 시작
  await app.listen(port);
  
  Logger.info(`Crypto Tracker Pro is running on: http://localhost:${port}`);
  Logger.info(`Connecting to Binance WebSocket stream...`);
  Logger.info(`API endpoints are available on: http://localhost:${port}`);
  Logger.info(`Swagger API Documentation: http://localhost:${port}/api-docs`);
}

// bootstrap() 함수 실행 - 앱 시작
bootstrap().catch((error) => {
  Logger.error('Failed to start application:', null, { error: error.message });
  process.exit(1);
}); 