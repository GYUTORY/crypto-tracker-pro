/**
 * ConfigService - 설정 관리 서비스
 * 
 * @Injectable() - NestJS 서비스 데코레이터
 * @Global() - 전역 모듈에서 사용 가능
 * 환경 변수 검증 및 설정 값 관리를 담당합니다.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { validate, validateEnvironmentSpecific, EnvironmentVariables } from './env.validation';

@Injectable()
export class ConfigService implements OnModuleInit {
  private validatedConfig: EnvironmentVariables;

  async onModuleInit() {
    // 모듈 초기화 시 환경 변수 검증 (선택적 변수만 검증)
    try {
      this.validatedConfig = validate(process.env);
      validateEnvironmentSpecific(this.validatedConfig);
    } catch (error) {
      // 검증 실패 시 기본값으로 초기화
      console.warn('환경 변수 검증 실패, 기본값 사용:', error.message);
      this.validatedConfig = {} as EnvironmentVariables;
    }
  }

  // 설정 값 가져오기 (환경 변수 우선)
  get<T>(key: string): T {
    // 환경 변수에서 먼저 찾기
    const envValue = process.env[key];
    if (envValue !== undefined) {
      return this.parseValue(envValue) as T;
    }
    
    // 검증된 설정에서 찾기
    return this.validatedConfig[key] as T;
  }

  /**
   * 환경 변수 값을 적절한 타입으로 파싱
   */
  private parseValue(value: string): any {
    // 숫자로 변환 가능한지 확인
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }
    
    // 불린 값 확인
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // 배열 형태 확인 (쉼표로 구분)
    if (value.includes(',')) {
      return value.split(',').map(item => item.trim());
    }
    
    // 기본적으로 문자열 반환
    return value;
  }

  // 앱 설정 가져오기
  getAppConfig() {
    return {
      name: 'Crypto Tracker Pro',
      version: '1.0.0',
      port: this.get<number>('PORT'),
      environment: this.get<string>('NODE_ENV'),
    };
  }

  // 데이터베이스 설정 가져오기
  getDatabaseConfig() {
    return {
      host: this.get<string>('DB_HOST'),
      port: this.get<number>('DB_PORT'),
      name: this.get<string>('DB_NAME'),
      username: this.get<string>('DB_USERNAME'),
      password: this.get<string>('DB_PASSWORD'),
    };
  }

  // TypeORM 설정 가져오기
  getTypeOrmConfig() {
    return {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
      logging: process.env.DB_LOGGING === 'true' || false,
      ssl: this.isProduction() ? { rejectUnauthorized: false } : false,
    };
  }

  // 바이낸스 API 설정 가져오기
  getBinanceConfig() {
    return {
      apiKey: this.get<string>('BINANCE_API_KEY'),
      secretKey: this.get<string>('BINANCE_SECRET_KEY'),
      baseUrl: this.get<string>('BINANCE_BASE_URL'),
      wsUrl: this.get<string>('BINANCE_WS_URL'),
      timeout: this.get<number>('BINANCE_TIMEOUT'),
      retryAttempts: this.get<number>('BINANCE_RETRY_ATTEMPTS'),
    };
  }

  // 캐시 설정 가져오기
  getCacheConfig() {
    return {
      ttl: this.get<number>('CACHE_TTL'),
      maxSize: this.get<number>('CACHE_MAX_SIZE'),
      cleanupInterval: this.get<number>('CACHE_CLEANUP_INTERVAL'),
    };
  }

  // 로깅 설정 가져오기
  getLoggingConfig() {
    return {
      level: this.get<string>('LOG_LEVEL'),
      format: this.get<string>('LOG_FORMAT'),
      file: this.get<string>('LOG_FILE'),
    };
  }

  // 보안 설정 가져오기
  getSecurityConfig() {
    return {
      jwtSecret: this.get<string>('JWT_SECRET'),
      bcryptRounds: this.get<number>('BCRYPT_ROUNDS'),
      jwtExpiresIn: this.get<string>('JWT_EXPIRES_IN'),
    };
  }

  // CORS 설정 가져오기
  getCorsConfig() {
    return {
      origin: this.get<string[]>('CORS_ORIGIN') || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: this.get<boolean>('CORS_CREDENTIALS') || true,
    };
  }

  // Google AI API 설정 가져오기
  getGoogleAIConfig() {
    return {
      apiKey: this.get<string>('GOOGLE_AI_API_KEY'),
      model: this.get<string>('GOOGLE_AI_MODEL') || 'gemini-1.5-flash',
      timeout: this.get<number>('GOOGLE_AI_TIMEOUT'),
    };
  }

  // 현재 환경이 프로덕션인지 확인
  isProduction(): boolean {
    return this.get<string>('NODE_ENV') === 'production';
  }

  // 현재 환경이 개발인지 확인
  isDevelopment(): boolean {
    return this.get<string>('NODE_ENV') === 'development';
  }

  // 현재 환경이 테스트인지 확인
  isTest(): boolean {
    return this.get<string>('NODE_ENV') === 'test';
  }

  // Redis 설정 가져오기
  getRedisConfig() {
    return {
      host: this.get<string>('REDIS_HOST') || 'localhost',
      port: this.get<number>('REDIS_PORT') || 6379,
      password: this.get<string>('REDIS_PASSWORD'),
      db: this.get<number>('REDIS_DB') || 0,
    };
  }

  // 외부 API 설정 가져오기
  getExternalApiConfig() {
    return {
      exchangeRateApiKey: this.get<string>('EXCHANGE_RATE_API_KEY'),
      newsApiKey: this.get<string>('NEWS_API_KEY'),
    };
  }
} 