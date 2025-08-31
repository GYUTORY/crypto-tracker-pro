/**
 * 바이낸스 WebSocket 스트리밍 구현체
 * 
 * 바이낸스 WebSocket을 통해 실시간 가격 데이터를 수신하고
 * 이벤트 기반으로 처리합니다.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as WebSocket from 'ws';
import { Price } from '../../domain/entities/price';
import { PriceUpdatedEvent } from '../../domain/events/price-updated.event';
import { StreamingRepository } from './streaming.repository';
import { ConfigService } from '../../config/config.service';
import Logger from '../../shared/logger';

@Injectable()
export class BinanceStreamingRepository implements StreamingRepository, OnModuleInit, OnModuleDestroy {
  private ws: WebSocket;
  private reconnectTimer: NodeJS.Timeout;
  private _isConnected = false;
  private readonly wsUrl: string;
  private readonly baseReconnectDelay = 1000; // 기본 재연결 딜레이 (1초)
  private readonly maxReconnectDelay = 30000; // 최대 재연결 딜레이 (30초)
  private reconnectAttempts = 0; // 재연결 시도 횟수
  private readonly maxReconnectAttempts = 10; // 최대 재연결 시도 횟수
  private subscriptions: Set<string> = new Set();

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {
    const binanceConfig = this.configService.getBinanceConfig();
    this.wsUrl = binanceConfig.wsUrl;
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      Logger.info(`바이낸스 WebSocket 연결 중: ${this.wsUrl}`);

      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        Logger.info('바이낸스 WebSocket 연결 완료');
        this._isConnected = true;
        this.reconnectAttempts = 0; // 연결 성공 시 재연결 시도 횟수 리셋
        this.resubscribeAll();
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleWebSocketMessage(data);
      });

      this.ws.on('close', () => {
        Logger.info('바이낸스 WebSocket 연결 종료');
        this._isConnected = false;
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        Logger.error('바이낸스 WebSocket 오류:', null, { error: error.message });
        this._isConnected = false;
        reject(error);
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this._isConnected = false;
    Logger.info('바이낸스 WebSocket 연결 해제');
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  async reconnect(): Promise<void> {
    Logger.info('수동 재연결 요청');
    await this.disconnect();
    await this.connect();
  }

  async subscribe(symbols: string[]): Promise<void> {
    const validSymbols = symbols.filter(symbol => this.isValidSymbol(symbol));
    
    if (validSymbols.length === 0) {
      throw new Error('유효한 심볼이 없습니다.');
    }

    // 바이낸스 표준 토픽 형식 사용
    const topics = validSymbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
    
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: topics,
      id: Date.now()
    };

    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(subscribeMessage));
      
      validSymbols.forEach(symbol => this.subscriptions.add(symbol));
      Logger.info(`바이낸스 스트림 구독 완료: ${validSymbols.join(', ')}`);
    } else {
      // 연결이 안 되어 있으면 구독 목록에만 추가
      validSymbols.forEach(symbol => this.subscriptions.add(symbol));
      Logger.info(`구독 대기 중: ${validSymbols.join(', ')}`);
    }
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    const topics = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
    
    const unsubscribeMessage = {
      method: 'UNSUBSCRIBE',
      params: topics,
      id: Date.now()
    };

    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(unsubscribeMessage));
    }

    symbols.forEach(symbol => this.subscriptions.delete(symbol));
    Logger.info(`바이낸스 스트림 구독 해제: ${symbols.join(', ')}`);
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  private handleWebSocketMessage(data: WebSocket.Data): void {
    try {
      const message = data.toString('utf8').trim();
      
      if (!message) return;

      const binanceData = JSON.parse(message);
      
      // 구독 확인 메시지 처리
      if (binanceData.result !== undefined) {
        Logger.info('구독 확인됨');
        return;
      }

      // 실제 가격 데이터 처리
      if (binanceData.data) {
        this.processPriceData(binanceData);
      }
    } catch (error) {
      Logger.error('WebSocket 메시지 처리 오류:', null, { error: error.message });
    }
  }

  private processPriceData(binanceData: any): void {
    try {
      const data = binanceData.data;
      const stream = binanceData.stream;

      // 티커 스트림 데이터 처리
      if (stream && stream.includes('@ticker')) {
        const price = Price.create(
          data.s,  // 심볼
          data.c,  // 현재 가격
          data.v,  // 거래량
          data.P   // 24시간 변동률
        );

        // 이벤트 발행
        const event = new PriceUpdatedEvent(price, 'websocket');
        this.eventEmitter.emit('price.updated', event);

        Logger.info(`가격 업데이트 이벤트 발행: ${price.symbol} = ${price.price}`);
      }
    } catch (error) {
      Logger.error('가격 데이터 처리 오류:', null, { error: error.message });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // 최대 재연결 시도 횟수 초과 시 중단
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Logger.error(`최대 재연결 시도 횟수 초과 (${this.maxReconnectAttempts}회). 재연결을 중단합니다.`);
      return;
    }

    // 지수 백오프 계산 (2^attempts * baseDelay)
    const exponentialDelay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    // 지터 추가 (±20% 랜덤 변동)
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    const finalDelay = Math.max(exponentialDelay + jitter, 100); // 최소 100ms

    Logger.info(`재연결 시도 ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} - ${Math.round(finalDelay)}ms 후 시도`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      Logger.info('바이낸스 WebSocket 재연결 시도 중...');
      this.connect().catch((error) => {
        Logger.error('재연결 실패:', null, { error: error.message });
        this.scheduleReconnect();
      });
    }, finalDelay);
  }

  private resubscribeAll(): void {
    if (this.subscriptions.size > 0) {
      const symbols = Array.from(this.subscriptions);
      this.subscribe(symbols).catch(error => {
        Logger.error('재구독 실패:', null, { error: error.message });
      });
    }
  }

  private isValidSymbol(symbol: string): boolean {
    // 바이낸스에서 지원하는 심볼 패턴 검증
    const validPattern = /^[A-Z0-9]+$/;
    const isValidFormat = validPattern.test(symbol) && symbol.length >= 3;
    
    // 바이낸스에서 실제로 지원하는 주요 심볼들 검증
    const supportedSymbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
      'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT',
      'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'ETCUSDT'
    ];
    
    return isValidFormat && supportedSymbols.includes(symbol.toUpperCase());
  }
}
