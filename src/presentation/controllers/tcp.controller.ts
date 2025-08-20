/**
 * TcpController - WebSocket 연결 상태 및 메모리 데이터 HTTP 컨트롤러
 * 
 * @Controller('tcp') - /tcp 경로로 시작하는 컨트롤러
 * @Get() - GET 요청 처리
 * @HttpCode() - HTTP 상태 코드 설정
 */
import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StreamingRepository } from '../../infrastructure/streaming/streaming.repository';
import { PriceRepository } from '../../domain/repositories/price-repository.interface';
import { BaseService, BaseResponse } from '../../shared/base-response';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';

/**
 * WebSocket 연결 상태 및 메모리 데이터 관리 API 그룹
 * 실시간 연결 상태와 메모리 저장소 정보 조회
 */
@ApiTags('tcp')
@Controller('tcp') // 모든 엔드포인트는 /tcp로 시작
export class TcpController extends BaseService {
  // constructor - 의존성 주입 (DI)
  constructor(
    @Inject('StreamingRepository')
    private readonly streamingRepository: StreamingRepository,
    @Inject('PriceRepository')
    private readonly priceRepository: PriceRepository,
  ) {
    super();
  }

  // @Get('status') - GET 요청 처리 (WebSocket 연결 상태 조회)
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
  async getStatus(): Promise<BaseResponse<{
    connection: { isConnected: boolean; url: string; lastUpdate: string };
    memory: { priceCount: number; symbols: string[]; validityDuration: number };
    timestamp: string;
  }>> {
    const isConnected = this.streamingRepository.isConnected();
    const subscriptions = this.streamingRepository.getSubscriptions();
    const allPrices = await this.priceRepository.findAll();
    
    return this.success(
      {
        connection: {
          isConnected,
          url: 'wss://stream.binance.com:9443/ws',
          lastUpdate: new Date().toISOString(),
        },
        memory: {
          priceCount: allPrices.length,
          symbols: allPrices.map(p => p.symbol),
          validityDuration: 30000, // 30초
        },
        timestamp: new Date().toISOString(),
      },
      'TCP status retrieved successfully'
    );
  }

  /**
   * GET /tcp/prices - 메모리에 저장된 모든 가격 데이터 조회
   */
  @ApiOperation({
    summary: '메모리 저장소의 모든 가격 데이터 조회',
    description: '메모리에 저장된 모든 암호화폐 가격 데이터를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '가격 데이터 조회 성공',
    type: BaseResponseDto
  })
  @Get('prices')
  @HttpCode(HttpStatus.OK)
  async getAllPrices(): Promise<BaseResponse<{
    prices: any[];
    count: number;
    symbols: string[];
    timestamp: string;
  }>> {
    const allPrices = await this.priceRepository.findAll();
    const symbols = await this.priceRepository.getSymbols();
    
    return this.success(
      {
        prices: allPrices.map(p => ({
          symbol: p.symbol,
          price: p.price,
          timestamp: p.timestamp,
          volume: p.volume,
          changePercent24h: p.changePercent24h,
        })),
        count: allPrices.length,
        symbols: symbols,
        timestamp: new Date().toISOString(),
      },
      'All prices retrieved successfully'
    );
  }

  /**
   * POST /tcp/reconnect - WebSocket 재연결
   */
  @ApiOperation({
    summary: 'WebSocket 재연결',
    description: '바이낸스 WebSocket 스트림과의 연결을 재시도합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '재연결 성공',
    type: BaseResponseDto
  })
  @Get('reconnect')
  @HttpCode(HttpStatus.OK)
  async reconnect(): Promise<BaseResponse<boolean>> {
    try {
      await this.streamingRepository.reconnect();
      return this.success(true, 'Reconnection completed successfully');
    } catch (error) {
      return this.fail('Reconnection failed');
    }
  }
} 