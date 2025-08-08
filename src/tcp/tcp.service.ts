/**
 * TcpService - 연결 상태와 제어를 BinanceRepository에 위임하는 경량 서비스
 *
 * WebSocket 실연결은 BinanceApiRepository 한 곳에서만 관리합니다.
 * 이 서비스는 연결 상태 조회와 수동 재연결만 노출합니다.
 */
import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { BaseService, BaseResponse } from '../shared/base-response';
import Logger from '../shared/logger';
import { BinanceRepository } from '../domain/repositories/binance-repository.interface';

@Injectable()
export class TcpService extends BaseService implements OnModuleInit, OnModuleDestroy {
  // Binance WS URL (상태 표시에 사용)
  private readonly BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

  constructor(
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository,
  ) {
    super();
  }

  // onModuleInit() - 모듈 초기화 시 자동 실행
  async onModuleInit() {
    // 실연결은 BinanceApiRepository에서 관리되므로 여기서는 아무 것도 하지 않습니다.
    Logger.info('TcpService initialized (delegating WS management to BinanceApiRepository)');
  }

  // onModuleDestroy() - 모듈 종료 시 자동 실행
  async onModuleDestroy() {
    // 실연결은 BinanceApiRepository에서 종료 처리됨
    Logger.info('TcpService destroyed');
  }

  /**
   * 연결 상태를 반환합니다.
   */
  getConnectionStatus(): {
    isConnected: boolean;
    url: string;
    lastUpdate: string;
  } {
    const isConnected = this.binanceRepository.isWebSocketConnected();
    return {
      isConnected,
      url: this.BINANCE_WS_URL,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * 연결 상태를 반환합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 연결 상태 정보
   */
  getConnectionStatusWithResponse(): BaseResponse<{
    isConnected: boolean;
    url: string;
    lastUpdate: string;
  }> {
    return this.success(
      this.getConnectionStatus(),
      'Connection status retrieved successfully'
    );
  }

  /**
   * 수동으로 재연결을 시도합니다.
   */
  async reconnect(): Promise<void> {
    Logger.info('Manual reconnection requested (delegated to BinanceApiRepository)...');
    await this.binanceRepository.reconnectWebSocket();
  }

  /**
   * 수동으로 재연결을 시도합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 재연결 결과
   */
  async reconnectWithResponse(): Promise<BaseResponse<boolean>> {
    try {
      await this.reconnect();
      return this.success(true, 'Reconnection completed successfully'
      );
    } catch (error) {
      return this.fail('Reconnection failed', null);
    }
  }
} 