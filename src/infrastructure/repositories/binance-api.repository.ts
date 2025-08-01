/**
 * 바이낸스 API 구현체
 * 
 * 바이낸스 REST API와 WebSocket을 통해 실시간 암호화폐 데이터를 가져옵니다.
 * WebSocket 연결은 서버 시작 시 자동으로 이루어지며, 연결이 끊어지면
 * 자동으로 재연결을 시도합니다. REST API는 WebSocket 데이터가 없거나
 * 만료된 경우의 폴백으로 사용됩니다.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as WebSocket from 'ws';
import axios from 'axios';
import { Price } from '../../domain/entities/price.entity';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { ConfigService } from '../../config/config.service';
import Logger from '../../shared/logger';

/**
 * 바이낸스 API 구현체
 * 
 * OnModuleInit, OnModuleDestroy를 구현하여 NestJS 생명주기에 맞춰
 * WebSocket 연결을 관리합니다.
 */
@Injectable()
export class BinanceApiRepository implements BinanceRepository, OnModuleInit, OnModuleDestroy {
  private ws: WebSocket;                    // WebSocket 연결 객체
  private reconnectTimer: NodeJS.Timeout;   // 재연결 타이머
  private isConnected = false;              // 연결 상태 플래그
  private readonly baseUrl: string;         // REST API 기본 URL
  private readonly wsUrl: string;           // WebSocket URL
  private readonly reconnectDelay = 5000;   // 재연결 대기 시간 (5초)

  constructor(private readonly configService: ConfigService) {
    const binanceConfig = this.configService.getBinanceConfig();
    this.baseUrl = binanceConfig.baseUrl;
    this.wsUrl = binanceConfig.wsUrl;
  }

  /**
   * 모듈 초기화 시 WebSocket 연결 시작
   * NestJS 생명주기에 의해 자동으로 호출됩니다.
   */
  async onModuleInit(): Promise<void> {
    await this.connectWebSocket();
  }

  /**
   * 모듈 종료 시 WebSocket 연결 정리
   * NestJS 생명주기에 의해 자동으로 호출됩니다.
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnectWebSocket();
  }

  /**
   * REST API를 통해 특정 심볼의 현재 가격을 조회
   * 
   * WebSocket 데이터가 없거나 만료된 경우의 폴백 메커니즘으로 사용됩니다.
   * 바이낸스 API v3의 ticker/price 엔드포인트를 호출합니다.
   */
  async getCurrentPrice(symbol: string): Promise<Price> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });

      // API 응답을 도메인 엔티티로 변환
      return Price.create(
        response.data.symbol,
        response.data.price
      );
    } catch (error) {
      // 400 에러는 잘못된 심볼을 의미
      if (error.response?.status === 400) {
        throw new Error(`잘못된 심볼: ${symbol}`);
      }
      throw new Error(`${symbol} 가격 조회 실패: ${error.message}`);
    }
  }

  /**
   * WebSocket 연결 시작
   * 
   * Promise를 반환하여 연결 완료를 기다릴 수 있도록 합니다.
   * 연결 성공 시 자동으로 가격 스트림을 구독합니다.
   */
  async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      Logger.info(`바이낸스 WebSocket 연결 중: ${this.wsUrl}`);

      this.ws = new WebSocket(this.wsUrl);

      // 연결 성공 시
      this.ws.on('open', () => {
        Logger.info('바이낸스 WebSocket 연결 완료');
        this.isConnected = true;
        this.subscribeToPriceStreams(); // 연결 후 즉시 스트림 구독
        resolve();
      });

      // 메시지 수신 시
      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleWebSocketMessage(data);
      });

      // 연결 종료 시
      this.ws.on('close', () => {
        Logger.info('바이낸스 WebSocket 연결 종료');
        this.isConnected = false;
        this.scheduleReconnect(); // 자동 재연결 스케줄링
      });

      // 에러 발생 시
      this.ws.on('error', (error) => {
        Logger.error('바이낸스 WebSocket 오류:', null, { error: error.message });
        this.isConnected = false;
        reject(error);
      });
    });
  }

  /**
   * WebSocket 연결 종료
   * 
   * 재연결 타이머를 정리하고 WebSocket을 안전하게 닫습니다.
   */
  async disconnectWebSocket(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.isConnected = false;
    Logger.info('바이낸스 WebSocket 연결 해제');
  }

  /**
   * WebSocket 연결 상태 확인
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * 수동 WebSocket 재연결
   * 
   * API를 통해 수동으로 재연결을 요청할 때 사용됩니다.
   */
  async reconnectWebSocket(): Promise<void> {
    Logger.info('수동 재연결 요청');
    await this.disconnectWebSocket();
    await this.connectWebSocket();
  }

  /**
   * 가격 스트림 구독
   * 
   * 바이낸스 WebSocket API에 구독 메시지를 전송하여
   * 실시간 가격 데이터를 받기 시작합니다.
   */
  private subscribeToPriceStreams(): void {
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
    Logger.info('바이낸스 가격 스트림 구독 완료');
  }

  /**
   * WebSocket 메시지 처리
   * 
   * 바이낸스로부터 받은 실시간 데이터를 파싱하고 처리합니다.
   * 구독 확인 메시지와 실제 가격 데이터를 구분하여 처리합니다.
   */
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

  /**
   * 가격 데이터 처리
   * 
   * WebSocket으로 받은 가격 데이터를 도메인 엔티티로 변환합니다.
   * 현재는 티커 데이터만 처리하고 있습니다.
   */
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

        Logger.info(`가격 업데이트: ${price.symbol} = ${price.price}`);
      }
    } catch (error) {
      Logger.error('가격 데이터 처리 오류:', null, { error: error.message });
    }
  }

  /**
   * 자동 재연결 스케줄링
   * 
   * 연결이 끊어지면 일정 시간 후에 자동으로 재연결을 시도합니다.
   * 재연결 실패 시 다시 스케줄링하여 무한 재시도를 방지합니다.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      Logger.info('바이낸스 WebSocket 재연결 시도 중...');
      this.connectWebSocket().catch((error) => {
        Logger.error('재연결 실패:', null, { error: error.message });
        this.scheduleReconnect(); // 재연결 실패 시 다시 스케줄링
      });
    }, this.reconnectDelay);
  }
} 