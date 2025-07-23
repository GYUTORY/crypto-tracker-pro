import { Injectable } from '@nestjs/common';
import * as config from 'config';

@Injectable()
export class ConfigService {
  /**
   * 설정 값을 가져옵니다.
   * @param key 설정 키 (예: 'app.port', 'database.host')
   * @returns 설정 값
   */
  get<T>(key: string): T {
    return config.get<T>(key);
  }

  /**
   * 앱 설정을 가져옵니다.
   */
  getAppConfig() {
    return {
      name: this.get<string>('app.name'),
      version: this.get<string>('app.version'),
      port: this.get<number>('app.port'),
      environment: this.get<string>('app.environment'),
    };
  }

  /**
   * 데이터베이스 설정을 가져옵니다.
   */
  getDatabaseConfig() {
    return {
      host: this.get<string>('database.host'),
      port: this.get<number>('database.port'),
      name: this.get<string>('database.name'),
      username: this.get<string>('database.username'),
      password: this.get<string>('database.password'),
    };
  }

  /**
   * 바이낸스 API 설정을 가져옵니다.
   */
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

  /**
   * 캐시 설정을 가져옵니다.
   */
  getCacheConfig() {
    return {
      ttl: this.get<number>('cache.ttl'),
      maxSize: this.get<number>('cache.maxSize'),
      cleanupInterval: this.get<number>('cache.cleanupInterval'),
    };
  }

  /**
   * 로깅 설정을 가져옵니다.
   */
  getLoggingConfig() {
    return {
      level: this.get<string>('logging.level'),
      format: this.get<string>('logging.format'),
      file: this.get<string>('logging.file'),
    };
  }

  /**
   * 보안 설정을 가져옵니다.
   */
  getSecurityConfig() {
    return {
      jwtSecret: this.get<string>('security.jwtSecret'),
      bcryptRounds: this.get<number>('security.bcryptRounds'),
      rateLimit: this.get<any>('security.rateLimit'),
    };
  }

  /**
   * CORS 설정을 가져옵니다.
   */
  getCorsConfig() {
    return {
      origin: this.get<string[]>('cors.origin'),
      credentials: this.get<boolean>('cors.credentials'),
    };
  }

  /**
   * 현재 환경이 프로덕션인지 확인합니다.
   */
  isProduction(): boolean {
    return this.get<string>('app.environment') === 'production';
  }

  /**
   * 현재 환경이 개발인지 확인합니다.
   */
  isDevelopment(): boolean {
    return this.get<string>('app.environment') === 'development';
  }

  /**
   * 현재 환경이 테스트인지 확인합니다.
   */
  isTest(): boolean {
    return this.get<string>('app.environment') === 'test';
  }
} 