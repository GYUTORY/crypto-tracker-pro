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
  
  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('Crypto Tracker Pro API')
    .setDescription('실시간 암호화폐 가격 추적 API')
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
  
  Logger.info(`서버 시작: http://localhost:${port}`);
  Logger.info(`API 문서: http://localhost:${port}/api-docs`);
}

// bootstrap() 함수 실행 - 앱 시작
bootstrap().catch((error) => {
  Logger.error('Failed to start application:', null, { error: error.message });
  process.exit(1);
}); 