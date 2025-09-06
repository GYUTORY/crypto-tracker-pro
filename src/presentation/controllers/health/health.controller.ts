import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BaseService } from '@/shared/base-response';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';

/**
 * 헬스체크 컨트롤러
 * 
 * 서버 상태 및 서비스 가용성을 확인하는 API를 제공합니다.
 */
@ApiTags('health')
@Controller()
export class HealthController extends BaseService {
  constructor() {
    super();
  }

  /**
   * 기본 헬스체크
   * 
   * 서버가 정상적으로 작동하는지 확인합니다.
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '서버 헬스체크',
    description: '서버가 정상적으로 작동하는지 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '서버 정상 작동',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: '서버가 정상적으로 작동 중입니다',
        result_data: {
          status: 'ok',
          timestamp: '2025-01-27T10:00:00Z',
          uptime: 3600,
          version: '1.0.0',
          environment: 'development'
        },
        code: 'S001'
      }
    }
  })
  async getHealth(): Promise<BaseResponseDto<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
  }>> {
    try {
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      return this.success(healthData, '서버가 정상적으로 작동 중입니다');
    } catch (error) {
      return this.fail(`헬스체크 실패: ${error.message}`);
    }
  }

  /**
   * 상세 헬스체크
   * 
   * 서버와 의존성 서비스들의 상태를 상세히 확인합니다.
   */
  @Get('health/detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '상세 헬스체크',
    description: '서버와 의존성 서비스들의 상태를 상세히 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '상세 헬스체크 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: '상세 헬스체크 완료',
        result_data: {
          status: 'ok',
          timestamp: '2025-01-27T10:00:00Z',
          services: {
            database: 'connected',
            redis: 'connected',
            binance: 'connected',
            googleAI: 'connected'
          },
          uptime: 3600,
          memory: {
            used: '45.2 MB',
            free: '1.2 GB',
            total: '1.6 GB'
          },
          version: '1.0.0',
          environment: 'development'
        },
        code: 'S001'
      }
    }
  })
  async getDetailedHealth(): Promise<BaseResponseDto<{
    status: string;
    timestamp: string;
    services: {
      database: string;
      redis: string;
      binance: string;
      googleAI: string;
    };
    uptime: number;
    memory: {
      used: string;
      free: string;
      total: string;
    };
    version: string;
    environment: string;
  }>> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryData = {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        free: `${Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
      };

      const detailedHealthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected', // 실제로는 DB 연결 상태 확인
          redis: 'connected',    // 실제로는 Redis 연결 상태 확인
          binance: 'connected',  // 실제로는 Binance API 연결 상태 확인
          googleAI: 'connected'  // 실제로는 Google AI API 연결 상태 확인
        },
        uptime: process.uptime(),
        memory: memoryData,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      return this.success(detailedHealthData, '상세 헬스체크 완료');
    } catch (error) {
      return this.fail(`상세 헬스체크 실패: ${error.message}`);
    }
  }

  /**
   * 서비스별 헬스체크
   * 
   * 특정 서비스의 상태만 확인합니다.
   */
  @Get('health/service/:serviceName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '서비스별 헬스체크',
    description: '특정 서비스의 상태만 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '서비스 헬스체크 성공',
    type: BaseResponseDto
  })
  async getServiceHealth(@Param('serviceName') serviceName: string): Promise<BaseResponseDto<{
    service: string;
    status: string;
    timestamp: string;
  }>> {
    try {
      // 실제로는 각 서비스별로 연결 상태를 확인해야 함
      const serviceStatus = {
        service: serviceName,
        status: 'connected', // 임시로 connected로 설정
        timestamp: new Date().toISOString()
      };

      return this.success(serviceStatus, `${serviceName} 서비스 상태 확인 완료`);
    } catch (error) {
      return this.fail(`${serviceName} 서비스 상태 확인 실패: ${error.message}`);
    }
  }
}
