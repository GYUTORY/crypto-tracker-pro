/**
 * AppController - 메인 HTTP 컨트롤러
 * 
 * NestJS에서 @Controller 데코레이터는 클래스를 컨트롤러로 정의합니다.
 * 컨트롤러는 클라이언트의 HTTP 요청을 받아서 처리하는 역할을 합니다.
 * 
 * 컨트롤러의 역할:
 * - HTTP 요청을 받아서 적절한 서비스로 전달
 * - 요청 데이터 검증 및 변환
 * - 응답 데이터 포맷팅
 * - 라우팅 설정 (URL 경로와 HTTP 메서드 매핑)
 * 
 * HTTP 메서드 데코레이터들:
 * - @Get(): GET 요청 처리
 * - @Post(): POST 요청 처리
 * - @Put(): PUT 요청 처리
 * - @Delete(): DELETE 요청 처리
 * - @Patch(): PATCH 요청 처리
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
  /**
   * 생성자에서 필요한 서비스들을 주입받습니다.
   * NestJS의 의존성 주입(DI) 시스템을 통해 자동으로 인스턴스가 생성됩니다.
   */
  constructor(
    private readonly appService: AppService,
  ) {
    super();
  }

  /**
   * GET / - 루트 경로에 대한 핸들러
   * 클라이언트가 GET 요청을 보내면 이 메서드가 실행됩니다.
   * 
   * @returns {BaseResponse<string>} 환영 메시지
   */
  @ApiOperation({
    summary: '환영 메시지',
    description: 'Crypto Tracker Pro API에 오신 것을 환영합니다. API 기본 정보와 사용 가능한 엔드포인트를 제공합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '환영 메시지 반환 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: 'Welcome to Crypto Tracker Pro API!',
        result_data: {
          message: 'Welcome to Crypto Tracker Pro API!',
          version: '1.0.0',
          documentation: 'http://localhost:3000/api-docs',
          endpoints: ['/health', '/binance/price/:symbol', '/tcp/status']
        },
        code: 'S001'
      }
    }
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  getHello(): BaseResponse<string> {
    // AppService의 getHello 메서드를 호출하여 응답
    return this.appService.getHello();
  }

  /**
   * GET /health - 헬스 체크 엔드포인트
   * 애플리케이션이 정상적으로 작동하는지 확인하는 용도
   * 
   * @returns {BaseResponse<object>} 헬스 상태 정보
   */
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