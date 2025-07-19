/**
 * TcpController - WebSocket 연결 상태 및 메모리 데이터 HTTP 컨트롤러
 * 
 * 이 컨트롤러는 바이낸스 WebSocket 연결 상태와 메모리에 저장된 가격 데이터를
 * HTTP API로 제공하는 역할을 합니다.
 * 
 * 기본 경로: /tcp
 * 
 * 주요 엔드포인트:
 * - GET /tcp/status - WebSocket 연결 상태 및 메모리 정보
 * - GET /tcp/prices - 메모리에 저장된 모든 가격 데이터
 * - GET /tcp/reconnect - WebSocket 재연결 시도
 * 
 * HTTP 상태 코드:
 * - 200: 성공
 * - 500: 서버 내부 오류
 */
import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { TcpService } from './tcp.service';
import { PriceStoreService } from './price-store.service';
import { BaseService, BaseResponse } from '../services/base.service';
import { BaseResponseDto } from '../dto/base-response.dto';
import { ConnectionStatusDto, MemoryInfoDto, PriceDataDto } from '../dto/price.dto';

@ApiTags('tcp')
@Controller('tcp') // 모든 엔드포인트는 /tcp로 시작
export class TcpController extends BaseService {
  /**
   * 생성자에서 TcpService와 PriceStoreService를 주입받습니다.
   * WebSocket 연결 상태와 메모리 데이터 관리를 담당합니다.
   */
  constructor(
    private readonly tcpService: TcpService,
    private readonly priceStoreService: PriceStoreService,
  ) {
    super();
  }

  /**
   * GET /tcp/status - WebSocket 연결 상태 및 메모리 정보 조회
   * 
   * @returns WebSocket 연결 상태와 메모리 정보
   */
  @ApiOperation({
    summary: 'WebSocket 연결 상태 및 메모리 정보',
    description: `
      바이낸스 WebSocket 스트림과의 연결 상태와 메모리에 저장된 가격 데이터 정보를 확인합니다.
      
      반환 정보:
      - connection: WebSocket 연결 상태 (isConnected, url, lastUpdate)
      - memory: 메모리 저장소 정보 (priceCount, symbols, validityDuration)
      - timestamp: 조회 시간
      
      연결 상태:
      - isConnected: true/false (연결 여부)
      - url: WebSocket 연결 URL
      - lastUpdate: 마지막 업데이트 시간
      
      메모리 정보:
      - priceCount: 저장된 가격 데이터 개수
      - symbols: 저장된 심볼 목록
      - validityDuration: 데이터 유효성 시간 (밀리초)
    `
  })
  @ApiResponse({
    status: 200,
    description: '연결 상태 조회 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: 'TCP status retrieved successfully',
        result_data: {
          connection: {
            isConnected: true,
            url: 'wss://stream.binance.com:9443/ws',
            lastUpdate: '2024-01-15T10:30:00.000Z'
          },
          memory: {
            priceCount: 2,
            symbols: ['BTCUSDT', 'ETHUSDT'],
            validityDuration: 30000
          },
          timestamp: '2024-01-15T10:30:00.000Z'
        },
        code: 'S001'
      }
    }
  })
  @Get('status')
  @HttpCode(HttpStatus.OK)
  getStatus(): BaseResponse<{
    connection: { isConnected: boolean; url: string; lastUpdate: string };
    memory: { priceCount: number; symbols: string[]; validityDuration: number };
    timestamp: string;
  }> {
    const connectionStatus = this.tcpService.getConnectionStatusWithResponse();
    const memoryInfo = this.priceStoreService.getMemoryInfoWithResponse();
    
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
   * 
   * @returns 모든 가격 데이터
   */
  @ApiOperation({
    summary: '메모리 저장된 모든 가격 데이터',
    description: `
      메모리에 저장된 모든 암호화폐 가격 데이터를 조회합니다.
      
      **데이터 특징:**
      - 30초 이내의 유효한 데이터만 반환
      - 만료된 데이터는 자동으로 삭제됨
      - WebSocket을 통해 실시간으로 업데이트됨
      
      **반환 정보:**
      - prices: 가격 데이터 배열
      - count: 데이터 개수
      - symbols: 심볼 목록
      - timestamp: 조회 시간
      
      **가격 데이터 구조:**
      - symbol: 암호화폐 심볼
      - price: 현재 가격
      - timestamp: 타임스탬프
      - volume: 거래량 (선택사항)
      - changePercent24h: 24시간 변화율 (선택사항)
    `
  })
  @ApiResponse({
    status: 200,
    description: '가격 데이터 조회 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: 'All prices retrieved successfully',
        result_data: {
          prices: [
            {
              symbol: 'BTCUSDT',
              price: '43250.50',
              timestamp: 1703123456789,
              volume: '1234.56',
              changePercent24h: '2.95'
            },
            {
              symbol: 'ETHUSDT',
              price: '2650.30',
              timestamp: 1703123456789,
              volume: '5678.90',
              changePercent24h: '1.25'
            }
          ],
          count: 2,
          symbols: ['BTCUSDT', 'ETHUSDT'],
          timestamp: '2024-01-15T10:30:00.000Z'
        },
        code: 'S001'
      }
    }
  })
  @Get('prices')
  @HttpCode(HttpStatus.OK)
  getAllPrices(): BaseResponse<{
    prices: any[];
    count: number;
    symbols: string[];
    timestamp: string;
  }> {
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

  /**
   * GET /tcp/reconnect - WebSocket 재연결 시도
   * 
   * @returns 재연결 시도 결과
   */
  @ApiOperation({
    summary: 'WebSocket 재연결',
    description: `
      바이낸스 WebSocket 스트림과의 연결을 수동으로 재시도합니다.
      
      **재연결 과정:**
      1. 기존 연결 종료
      2. 5초 대기
      3. 새로운 연결 시도
      4. 가격 스트림 구독
      
      **사용 시나리오:**
      - 연결이 끊어진 상태에서 즉시 재연결이 필요한 경우
      - 네트워크 문제로 인한 연결 복구
      - 수동 연결 테스트
    `
  })
  @ApiResponse({
    status: 200,
    description: '재연결 시도 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: 'WebSocket reconnection initiated successfully',
        result_data: true,
        code: 'S001'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: '재연결 시도 실패',
    type: BaseResponseDto,
    schema: {
      example: {
        result: false,
        msg: 'Failed to reconnect WebSocket',
        result_data: false,
        code: 'E500'
      }
    }
  })
  @Get('reconnect')
  @HttpCode(HttpStatus.OK)
  async reconnect(): Promise<BaseResponse<boolean>> {
    try {
      const result = await this.tcpService.reconnectWithResponse();
      return result;
    } catch (error) {
      return this.createErrorResponse(
        `Failed to reconnect: ${error.message}`,
        'E500'
      );
    }
  }
} 