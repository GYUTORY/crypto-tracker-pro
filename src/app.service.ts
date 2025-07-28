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