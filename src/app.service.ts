/**
 * AppService - 메인 애플리케이션 서비스
 * 
 * @Injectable() - NestJS 서비스 데코레이터
 * 의존성 주입(DI)으로 자동 인스턴스 생성 및 관리
 */
import { Injectable } from '@nestjs/common';
import { BaseService, BaseResponse } from './services/base.service';

@Injectable()
export class AppService extends BaseService {

  // 애플리케이션 정보 반환
  getAppInfo(): BaseResponse<{ name: string; version: string; description: string }> {
    const appInfo = {
      name: 'Crypto Tracker Pro',
      version: '1.0.0',
      description: 'Bitcoin Binance WebSocket Tracker with NestJS',
    };

    return this.success(
      appInfo,
      'Application information retrieved successfully'
    );
  }

  // 현재 서버 시간 반환
  getCurrentTime(): BaseResponse<string> {
    const currentTime = new Date().toISOString();
    
    return this.success(
      currentTime,
      'Current server time retrieved successfully'
    );
  }

  // 애플리케이션 헬스 체크
  getHealth(): BaseResponse<{ status: string; timestamp: string }> {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };

    return this.success(
      healthData,
      'Health check successful'
    );
  }
} 