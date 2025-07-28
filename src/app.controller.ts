/**
 * AppController - 메인 HTTP 컨트롤러
 * 
 * @Controller() - NestJS 컨트롤러 데코레이터
 * @Get() - GET 요청 처리
 * @ApiTags() - Swagger 태그 설정
 * @ApiOperation() - API 설명 설정
 * @ApiResponse() - 응답 스키마 설정
 */
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { BaseService, BaseResponse } from './services/base.service';
import { BaseResponseDto } from './dto/base-response.dto';
import { WelcomeResponseDto, HealthResponseDto } from './dto/health.dto';

@ApiTags('health')
@Controller() // 기본 경로 '/'에 대한 컨트롤러
export class AppController extends BaseService {
  // constructor - 의존성 주입 (DI)
  constructor(private readonly appService: AppService) {
    super();
  }
 

  // @Get('health') - GET 요청 처리 (경로 '/health')
  @ApiOperation({
    summary: '헬스체크',
    description: '서버의 현재 상태를 확인합니다. 서버 상태, 업타임, 메모리 사용량, WebSocket 연결 상태를 반환합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '헬스체크 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: 'Health check successful',
        result_data: {
          status: 'OK',
          timestamp: '2024-01-15T10:30:00.000Z',
          uptime: 3600000,
          memory: {
            used: 52428800,
            total: 1073741824,
            percentage: 4.88
          },
          websocketConnected: true
        },
        code: 'S001'
      }
    }
  })
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth(): BaseResponse<{ status: string; timestamp: string }> {
    // AppService의 getHealth 메서드를 호출하여 BaseService의 통일된 응답 형식 사용
    return this.appService.getHealth();
  }
} 