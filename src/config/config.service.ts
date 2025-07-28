/**
 * ConfigService - 설정 관리 서비스
 * 
 * @Injectable() - NestJS 서비스 데코레이터
 * @Global() - 전역 모듈에서 사용 가능
 * config 라이브러리를 통한 설정 값 관리
 */
import { Injectable } from '@nestjs/common';
import * as config from 'config';

@Injectable()
export class ConfigService {
  // 설정 값 가져오기
  get<T>(key: string): T {
    return config.get<T>(key);
  }

  // 앱 설정 가져오기
  getAppConfig() {
    return {
      name: this.get<string>('app.name'),
      version: this.get<string>('app.version'),
      port: this.get<number>('app.port'),
      environment: this.get<string>('app.environment'),
    };
  }

  // 데이터베이스 설정 가져오기
  getDatabaseConfig() {
    return {
      host: this.get<string>('database.host'),
      port: this.get<number>('database.port'),
      name: this.get<string>('database.name'),
      username: this.get<string>('database.username'),
      password: this.get<string>('database.password'),
    };
  }

  // 바이낸스 API 설정 가져오기
  getBinanceConfig() {
    return {
      apiKey: this.get<string>('binance.apiKey'),
      secretKey: this.get<string>('binance.secretKey'),
      baseUrl: this.get<string>('binance.baseUrl'),
      wsUrl: this.get<string>('binance.wsUrl'),
      timeout: this.get<number>('binance.timeout'),
      retryAttempts: this.get<number>('binance.retryAttempts'),
    };
  }

  // 캐시 설정 가져오기
  getCacheConfig() {
    return {
      ttl: this.get<number>('cache.ttl'),
      maxSize: this.get<number>('cache.maxSize'),
      cleanupInterval: this.get<number>('cache.cleanupInterval'),
    };
  }

  // 로깅 설정 가져오기
  getLoggingConfig() {
    return {
      level: this.get<string>('logging.level'),
      format: this.get<string>('logging.format'),
      file: this.get<string>('logging.file'),
    };
  }

  // 보안 설정 가져오기
  getSecurityConfig() {
    return {
      jwtSecret: this.get<string>('security.jwtSecret'),
      bcryptRounds: this.get<number>('security.bcryptRounds'),
      rateLimit: this.get<any>('security.rateLimit'),
    };
  }

  // CORS 설정 가져오기
  getCorsConfig() {
    return {
      origin: this.get<string[]>('cors.origin'),
      credentials: this.get<boolean>('cors.credentials'),
    };
  }

  // Google AI API 설정 가져오기
  getGoogleAIConfig() {
    return {
      apiKey: this.get<string>('googleai.apiKey'),
      model: this.get<string>('googleai.model'),
      timeout: this.get<number>('googleai.timeout'),
    };
  }

  // 현재 환경이 프로덕션인지 확인
  isProduction(): boolean {
    return this.get<string>('app.environment') === 'production';
  }

  // 현재 환경이 개발인지 확인
  isDevelopment(): boolean {
    return this.get<string>('app.environment') === 'development';
  }

  // 현재 환경이 테스트인지 확인
  isTest(): boolean {
    return this.get<string>('app.environment') === 'test';
  }
} 