/**
 * 바이낸스 API 접근 인터페이스
 */
import { Price } from '../entities/price.entity';

export interface BinanceRepository {
  getCurrentPrice(symbol: string): Promise<Price>;
  connectWebSocket(): Promise<void>;
  disconnectWebSocket(): Promise<void>;
  isWebSocketConnected(): boolean;
  reconnectWebSocket(): Promise<void>;
} 