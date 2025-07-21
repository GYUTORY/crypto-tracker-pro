/**
 * AppService - 메인 애플리케이션 서비스
 * 
 * NestJS에서 @Injectable 데코레이터는 클래스를 서비스로 정의합니다.
 * 서비스는 비즈니스 로직을 담당하는 클래스입니다.
 * 
 * 서비스의 역할:
 * - 비즈니스 로직 처리
 * - 데이터베이스 접근
 * - 외부 API 호출
 * - 데이터 변환 및 가공
 * - 컨트롤러에서 호출되어 실제 작업을 수행
 * 
 * 의존성 주입(DI) 시스템:
 * - NestJS는 자동으로 서비스의 인스턴스를 생성하고 관리
 * - 컨트롤러나 다른 서비스에서 생성자를 통해 주입받아 사용
 * - 싱글톤 패턴으로 관리되어 메모리 효율적
 */
import { Injectable } from '@nestjs/common';
import { BaseService, BaseResponse } from './services/base.service';

@Injectable()
export class AppService extends BaseService {
  /**
   * 기본 환영 메시지를 반환하는 메서드
   * 
   * @returns {BaseResponse<string>} 환영 메시지
   */
  getHello(): BaseResponse<string> {
    return this.success(
      'Welcome to Crypto Tracker Pro!',
      'Welcome message retrieved successfully'
    );
  }

  /**
   * 애플리케이션 정보를 반환하는 메서드
   * 
   * @returns {BaseResponse<object>} 애플리케이션 정보
   */
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

  /**
   * 현재 서버 시간을 반환하는 메서드
   * 
   * @returns {BaseResponse<string>} ISO 형식의 현재 시간
   */
  getCurrentTime(): BaseResponse<string> {
    const currentTime = new Date().toISOString();
    
    return this.success(
      currentTime,
      'Current server time retrieved successfully'
    );
  }

  /**
   * 애플리케이션 헬스 체크를 수행하는 메서드
   * 
   * @returns {BaseResponse<object>} 헬스 상태 정보
   */
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