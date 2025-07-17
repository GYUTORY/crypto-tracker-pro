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
import { AppService } from './app.service';
import { TcpService } from './tcp/tcp.service';
import { PriceStoreService } from './tcp/price-store.service';
import { BaseService, BaseResponse } from './services/base.service';

@Controller() // 기본 경로 '/'에 대한 컨트롤러
export class AppController extends BaseService {
  /**
   * 생성자에서 필요한 서비스들을 주입받습니다.
   * NestJS의 의존성 주입(DI) 시스템을 통해 자동으로 인스턴스가 생성됩니다.
   */
  constructor(
    private readonly appService: AppService,
    private readonly tcpService: TcpService,
    private readonly priceStoreService: PriceStoreService,
  ) {
    super();
  }

  /**
   * GET / - 루트 경로에 대한 핸들러
   * 클라이언트가 GET 요청을 보내면 이 메서드가 실행됩니다.
   * 
   * @returns {BaseResponse<string>} 환영 메시지
   */
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
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth(): BaseResponse<{ status: string; timestamp: string }> {
    // AppService의 getHealth 메서드를 호출하여 BaseService의 통일된 응답 형식 사용
    return this.appService.getHealth();
  }

  /**
   * GET /tcp/status - 바이낸스 WebSocket 연결 상태 확인 엔드포인트
   * 바이낸스 WebSocket 스트림과의 연결 상태 및 메모리 정보를 확인
   * 
   * @returns {BaseResponse<object>} 바이낸스 연결 상태 정보
   */
  @Get('tcp/status')
  @HttpCode(HttpStatus.OK)
  getTcpStatus(): BaseResponse<{
    connection: { isConnected: boolean; url: string; lastUpdate: string };
    memory: { priceCount: number; symbols: string[]; validityDuration: number };
    timestamp: string;
  }> {
    // TcpService와 PriceStoreService의 BaseResponse 메서드들을 사용하여 통일된 응답 형식 적용
    const connectionStatus = this.tcpService.getConnectionStatusWithResponse();
    const memoryInfo = this.priceStoreService.getMemoryInfoWithResponse();
    
    // 두 서비스의 결과를 조합하여 새로운 응답 생성
    if (connectionStatus.result && memoryInfo.result) {
      return this.createSuccessResponse(
        {
          connection: connectionStatus.result_data,
          memory: memoryInfo.result_data,
          timestamp: new Date().toISOString(),
        },
        'TCP status retrieved successfully'
      );
    } else {
      return this.createErrorResponse('Failed to retrieve TCP status');
    }
  }

  /**
   * GET /tcp/prices - 메모리에 저장된 모든 가격 데이터 조회
   * TCP를 통해 받은 모든 가격 정보를 반환
   * 
   * @returns {BaseResponse<object>} 모든 가격 데이터
   */
  @Get('tcp/prices')
  @HttpCode(HttpStatus.OK)
  getAllPrices(): BaseResponse<{
    prices: any[];
    count: number;
    symbols: string[];
    timestamp: string;
  }> {
    // PriceStoreService의 BaseResponse 메서드를 사용하여 통일된 응답 형식 적용
    const pricesResponse = this.priceStoreService.getAllPricesWithResponse();
    
    if (pricesResponse.result) {
      return this.createSuccessResponse(
        {
          prices: pricesResponse.result_data,
          count: this.priceStoreService.getPriceCount(),
          symbols: this.priceStoreService.getSymbols(),
          timestamp: new Date().toISOString(),
        },
        'All prices retrieved successfully'
      );
    } else {
      return this.createErrorResponse('Failed to retrieve prices');
    }
  }
} 