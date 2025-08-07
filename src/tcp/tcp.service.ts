/**
 * TcpService - 바이낸스 WebSocket 연결 서비스
 * 
 * @Injectable() - NestJS 서비스 데코레이터
 * OnModuleInit - 모듈 초기화 시 자동 실행
 * OnModuleDestroy - 모듈 종료 시 자동 실행
 * WebSocket 연결 및 실시간 데이터 수신
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as WebSocket from 'ws';
import { PriceStoreService, PriceData } from './price-store.service';
import { BaseService, BaseResponse } from '../shared/base-response';
import Logger from '../shared/logger';

@Injectable()
export class TcpService extends BaseService implements OnModuleInit, OnModuleDestroy {
  private ws: WebSocket;
  private reconnectTimer: NodeJS.Timeout;
  private readonly BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
  private readonly RECONNECT_DELAY = 5000; // 5초
  private isConnected = false;

  constructor(private readonly priceStoreService: PriceStoreService) {
    super();
  }

  // onModuleInit() - 모듈 초기화 시 자동 실행
  async onModuleInit() {
    await this.connectToBinance();
  }

  // onModuleDestroy() - 모듈 종료 시 자동 실행
  async onModuleDestroy() {
    await this.disconnect();
  }

  // 바이낸스 WebSocket 스트림에 연결
  private async connectToBinance(): Promise<void> {
    return new Promise((resolve, reject) => {
      Logger.info(`🔗 Connecting to Binance WebSocket stream at ${this.BINANCE_WS_URL}...`);

      this.ws = new WebSocket(this.BINANCE_WS_URL);

      // 연결 성공 시
      this.ws.on('open', () => {
        Logger.info(`Connected to Binance WebSocket stream`);
        this.isConnected = true;
        
        // 구독 메시지 전송 (비트코인 가격 스트림)
        this.subscribeToPriceStreams();
        
        resolve();
      });

      // 데이터 수신 시
      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleBinanceData(data);
      });

      // 연결 종료 시
      this.ws.on('close', () => {
        Logger.info('Connection to Binance WebSocket stream closed');
        this.isConnected = false;
        this.scheduleReconnect();
      });

      // 에러 발생 시
      this.ws.on('error', (error) => {
        Logger.error('Binance WebSocket connection error:', null, { error: error.message });
        this.isConnected = false;
        reject(error);
      });

      // 연결 시도
      this.ws.on('ping', () => {
        this.ws.pong();
      });
    });
  }

  /**
   * 바이낸스 가격 스트림을 구독합니다.
   */
  private subscribeToPriceStreams(): void {
    // 비트코인 가격 스트림 구독 (KRW)
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [
        'btckrw@ticker',   // 비트코인 실시간 티커 (KRW)
        'ethkrw@ticker',   // 이더리움 실시간 티커 (KRW)
        'btckrw@trade',    // 비트코인 실시간 거래 (KRW)
        'ethkrw@trade'     // 이더리움 실시간 거래 (KRW)
      ],
      id: 1
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    Logger.info('Subscribed to Binance price streams (KRW)');
  }

  /**
   * 바이낸스로부터 받은 데이터를 처리합니다.
   * 
   * @param data 받은 데이터
   */
  private handleBinanceData(data: WebSocket.Data): void {
    try {
      const message = data.toString('utf8').trim();
      
      // 원본 데이터 로깅
      Logger.debug('📥 Binance Raw Data:', null, { message });
      
      // 빈 메시지 무시
      if (!message) {
        return;
      }

      // JSON 파싱
      const binanceData = JSON.parse(message);
      
      // 구독 확인 메시지 무시
      if (binanceData.result !== undefined) {
        Logger.info('📨 Subscription confirmed:', null, { binanceData });
        return;
      }

      // 가격 데이터 처리
      if (binanceData.data) {
        this.processPriceData(binanceData);
      }

    } catch (error) {
      Logger.error('Error processing Binance data:', null, { error: error.message });
    }
  }

  /**
   * 바이낸스 가격 데이터를 처리하여 메모리에 저장합니다.
   * 
   * @param binanceData 바이낸스 데이터
   */
  private processPriceData(binanceData: any): void {
    try {
      const data = binanceData.data;
      const stream = binanceData.stream;

      if (stream && stream.includes('@ticker')) {
        // 티커 데이터 처리
        const symbol = data.s;
        const price = data.c; // 현재 가격
        const volume = data.v; // 거래량
        const priceChange = data.P; // 24시간 가격 변화율

        const priceData: PriceData = {
          symbol: symbol,
          price: price,
          timestamp: Date.now(),
          volume: volume,
          changePercent24h: priceChange
        };

        // 메모리에 저장
        this.priceStoreService.setPrice(priceData);
        
        Logger.info(`Price updated: ${symbol} = $${price} (${priceChange}%)`);
      }

    } catch (error) {
      Logger.error('Error processing price data:', null, { error: error.message });
    }
  }

  /**
   * 재연결을 스케줄링합니다.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      Logger.info('Attempting to reconnect to Binance WebSocket stream...');
      this.connectToBinance().catch((error) => {
        Logger.error('Reconnection failed:', null, { error: error.message });
        this.scheduleReconnect();
      });
    }, this.RECONNECT_DELAY);
  }

  /**
   * 연결을 종료합니다.
   */
  private async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.isConnected = false;
    Logger.info('Disconnected from Binance WebSocket stream');
  }

  /**
   * 연결 상태를 반환합니다.
   * 
   * @returns 연결 상태 정보
   */
  getConnectionStatus(): {
    isConnected: boolean;
    url: string;
    lastUpdate: string;
  } {
    return {
      isConnected: this.isConnected,
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
    Logger.info('Manual reconnection requested...');
    await this.disconnect();
    await this.connectToBinance();
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