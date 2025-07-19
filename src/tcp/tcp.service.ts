/**
 * TcpService - 바이낸스 WebSocket 연결 서비스
 * 
 * 이 서비스는 바이낸스의 WebSocket 스트림에 직접 연결하여 실시간 비트코인 가격 정보를
 * 받아와서 PriceStoreService에 저장하는 역할을 합니다.
 * 
 * 주요 기능:
 * - 바이낸스 WebSocket 스트림 연결 및 관리
 * - 실시간 가격 데이터 수신 및 파싱
 * - 메모리 저장소에 데이터 저장
 * - 연결 상태 모니터링 및 재연결
 * - 데이터 유효성 검증
 * 
 * 바이낸스 WebSocket 스트림 정보:
 * - URL: wss://stream.binance.com:9443/ws
 * - 데이터 형식: JSON 스트림
 * 
 * 연결 관리:
 * - 자동 재연결 (연결 끊어지면 5초 후 재시도)
 * - 하트비트 메시지 처리
 * - 에러 처리 및 로깅
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as WebSocket from 'ws';
import { PriceStoreService, PriceData } from './price-store.service';
import { BaseService, BaseResponse } from '../services/base.service';

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

  /**
   * 모듈 초기화 시 바이낸스 WebSocket 스트림에 연결
   */
  async onModuleInit() {
    await this.connectToBinance();
  }

  /**
   * 모듈 종료 시 연결을 정리
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * 바이낸스 WebSocket 스트림에 연결
   */
  private async connectToBinance(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔗 Connecting to Binance WebSocket stream at ${this.BINANCE_WS_URL}...`);

      this.ws = new WebSocket(this.BINANCE_WS_URL);

      // 연결 성공 시
      this.ws.on('open', () => {
        console.log(`✅ Connected to Binance WebSocket stream`);
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
        console.log('❌ Connection to Binance WebSocket stream closed');
        this.isConnected = false;
        this.scheduleReconnect();
      });

      // 에러 발생 시
      this.ws.on('error', (error) => {
        console.error('❌ Binance WebSocket connection error:', error.message);
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
    // 비트코인 가격 스트림 구독
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [
        'btcusdt@ticker',  // 비트코인 실시간 티커
        'ethusdt@ticker',  // 이더리움 실시간 티커
        'btcusdt@trade',   // 비트코인 실시간 거래
        'ethusdt@trade'    // 이더리움 실시간 거래
      ],
      id: 1
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log('📡 Subscribed to Binance price streams');
  }

  /**
   * 바이낸스로부터 받은 데이터를 처리합니다.
   * 
   * @param data 받은 데이터
   */
  private handleBinanceData(data: WebSocket.Data): void {
    try {
      const message = data.toString('utf8').trim();
      
      // 원본 데이터 콘솔 출력
      console.log('📥 Binance Raw Data:', message);
      
      // 빈 메시지 무시
      if (!message) {
        return;
      }

      // JSON 파싱
      const binanceData = JSON.parse(message);
      
      // 구독 확인 메시지 무시
      if (binanceData.result !== undefined) {
        console.log('📨 Subscription confirmed:', binanceData);
        return;
      }

      // 가격 데이터 처리
      if (binanceData.data) {
        this.processPriceData(binanceData);
      }

    } catch (error) {
      console.error('Error processing Binance data:', error);
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
        
        console.log(`💰 Price updated: ${symbol} = $${price} (${priceChange}%)`);
      }

    } catch (error) {
      console.error('Error processing price data:', error);
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
      console.log('🔄 Attempting to reconnect to Binance WebSocket stream...');
      this.connectToBinance().catch((error) => {
        console.error('Reconnection failed:', error);
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
    console.log('🔌 Disconnected from Binance WebSocket stream');
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
    return this.createSuccessResponse(
      this.getConnectionStatus(),
      'Connection status retrieved successfully'
    );
  }

  /**
   * 수동으로 재연결을 시도합니다.
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Manual reconnection requested...');
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
      return this.createSuccessResponse(
        true,
        'Reconnection completed successfully'
      );
    } catch (error) {
      return this.createInternalErrorResponse(
        'Reconnection failed',
        null
      );
    }
  }
} 