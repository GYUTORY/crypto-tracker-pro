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
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import Logger from './shared/logger';

async function bootstrap() {
  // NestFactory.create() - AppModule을 루트로 앱 인스턴스 생성
  const app = await NestFactory.create(AppModule);
  
  // 보안 헤더 설정
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS 설정 - 모든 네트워크에서 접근 가능하도록 설정
  const isProduction = process.env.NODE_ENV === 'production';
  const domainList = [];
  app.enableCors({
    origin: true, // 모든 도메인 허용 (개발 환경)
    credentials: true, // 쿠키/인증 헤더 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
  });

  // 글로벌 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
    transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
  }));
  
  // Swagger 문서 설정 - 환경에 따라 조건부 활성화
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Crypto Tracker Pro API')
      .setDescription(`
        실시간 암호화폐 가격 추적 및 AI 분석 API

        ## 주요 기능
        - 실시간 암호화폐 가격 조회 (메모리 캐시 + 바이낸스 API)
        - AI 기반 기술적 분석 및 가격 예측
        - WebSocket을 통한 실시간 데이터 스트리밍
        - 메모리 기반 고성능 캐싱 시스템

        ## API 그룹
        - **price**: 실시간 가격 조회 API
        - **binance**: 바이낸스 데이터 직접 조회
        - **AI Analysis**: AI 기반 기술적 분석 및 예측
        - **prediction**: 가격 예측 모델 API
        - **tcp**: WebSocket 연결 상태 및 메모리 관리
        - **health**: 시스템 상태 확인

        ## 사용 예시
        \`\`\`bash
        # 실시간 가격 조회
        GET /price/BTCUSDT
        
        # AI 기술적 분석
        POST /ai/technical-analysis
        {
          "symbol": "BTCUSDT"
        }
        
        # 가격 예측
        GET /prediction/BTCUSDT?timeframes=1h,24h,1w
        \`\`\`
      `)
      .setVersion('1.0.0')
      .setContact('Crypto Tracker Pro', 'https://github.com/your-repo', 'dev@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addTag('price', '실시간 암호화폐 가격 조회 API')
      .addTag('binance', '바이낸스 가격 데이터 직접 조회')
      .addTag('AI Analysis', 'AI 기반 기술적 분석 및 예측')
      .addTag('prediction', '가격 예측 모델 API')
      .addTag('streaming', 'WebSocket 연결 상태 관리 및 동적 심볼 구독/해제 API')
      .addTag('tcp', 'WebSocket 연결 상태 및 메모리 데이터 관리')
      .addTag('symbols', '거래 가능한 코인 목록 조회 API')
      .addTag('health', '시스템 상태 확인 및 헬스체크')
      .addServer('http://localhost:3000', '로컬 개발 서버')
      .addServer('http://172.30.1.4:3000', '네트워크 개발 서버')
      .addServer('https://api.cryptotracker.com', '프로덕션 서버')
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
        docExpansion: 'list', // 기본적으로 모든 API 그룹을 펼침
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
      },
      customSiteTitle: 'Crypto Tracker Pro API Documentation',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2c3e50; font-size: 36px; font-weight: 600; }
        .swagger-ui .info .description { font-size: 16px; line-height: 1.6; color: #34495e; }
        .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .swagger-ui .opblock-tag { font-size: 18px; font-weight: 600; color: #2c3e50; }
        .swagger-ui .opblock-summary-description { color: #7f8c8d; }
        .swagger-ui .response-col_status { font-weight: 600; }
        .swagger-ui .response-col_description { color: #34495e; }
        .swagger-ui .model { font-size: 14px; }
        .swagger-ui .model-title { color: #2c3e50; font-weight: 600; }
      `,
    });
  } else {
    Logger.warn('프로덕션 환경에서는 Swagger 문서가 비활성화됩니다.');
  }

  // app.setGlobalPrefix('api') - 글로벌 경로 프리픽스 (현재 미사용)
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0'; // 모든 네트워크 인터페이스에서 접근 가능
  
  // app.listen() - HTTP 서버 시작
  await app.listen(port, host);
  
  // 로컬 IP 주소 가져오기
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // 첫 번째 유효한 IP 주소 찾기
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  Logger.info(`서버 시작: http://localhost:${port}`);
  Logger.info(`네트워크 접근: http://${localIP}:${port}`);
  Logger.info(`API 문서: http://localhost:${port}/api-docs`);
  Logger.info(`API 문서 (네트워크): http://${localIP}:${port}/api-docs`);
}

// bootstrap() 함수 실행 - 앱 시작
bootstrap().catch((error) => {
  Logger.error('Failed to start application:', null, { error: error.message });
  process.exit(1);
}); 