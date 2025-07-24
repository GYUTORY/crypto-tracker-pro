/**
 * * 
 * 주요 기능:
 * - NestJS 애플리케이션 인스턴스 생성
 * - 미들웨어 설정
 * - 글로벌 파이프 설정
 * - CORS 설정
 * - Swagger API 문서화 설정
 * - 서버 포트 설정 및 시작
 * 
 * 실행 순서:
 * 1. NestFactory.create()로 애플리케이션 인스턴스 생성
 * 2. 미들웨어 및 글로벌 설정 적용
 * 3. Swagger 문서화 설정
 * 4. app.listen()으로 HTTP 서버 시작
 * 5. WebSocket 서버도 자동으로 시작됨
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
 * 
 * API 문서:
 * - Swagger UI: http://localhost:3000/api-docs
 * - OpenAPI JSON: http://localhost:3000/api-docs-json
 */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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
  
  // Swagger API 문서화 설정
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

      응답 형식:
      모든 API 응답은 다음과 같은 BaseResponse 형태로 반환됩니다:
      {
        "result": true,
        "msg": "성공 메시지",
        "result_data": {
          // 실제 데이터
        },
        "code": "S001"
      }

      WebSocket 연결 정보:
      - URL: wss://stream.binance.com:9443/ws
      - 구독 스트림: btcusdt@ticker, ethusdt@ticker, btcusdt@trade, ethusdt@trade
      - 자동 재연결: 연결 끊어지면 5초 후 자동 재시도

      성능 특징:
      - 빠른 응답: 메모리 기반 조회로 밀리초 단위 응답
      - 실시간 데이터: WebSocket을 통한 실시간 가격 업데이트
      - 데이터 유효성: 30초 자동 만료로 오래된 데이터 제거
    `)
    .setVersion('1.0.0')
    .setContact('Crypto Tracker Pro', 'https://github.com/your-repo', 'your-email@example.com')
    .addTag('health', '헬스체크 및 기본 정보')
    .addTag('binance', '바이낸스 가격 데이터 API')
    .addTag('tcp', 'WebSocket 연결 상태 및 메모리 데이터')
    .addServer('http://localhost:3000', '개발 서버')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Swagger UI 설정
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

  // 글로벌 프리픽스 설정 (제거됨)
  // 모든 API 엔드포인트가 루트 경로에서 직접 접근 가능
  // app.setGlobalPrefix('api');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Crypto Tracker Pro is running on: http://localhost:${port}`);
  console.log(`Connecting to Binance WebSocket stream...`);
  console.log(`API endpoints are available on: http://localhost:${port}`);
  console.log(`Swagger API Documentation: http://localhost:${port}/api-docs`);
}

// 애플리케이션 시작
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 