/**
 * 스트리밍 서비스 인터페이스
 * 
 * WebSocket 연결 관리와 실시간 데이터 스트리밍을 담당합니다.
 * 도메인 인터페이스에서 인프라 세부사항을 분리합니다.
 */
export interface StreamingRepository {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  reconnect(): Promise<void>;
  subscribe(symbols: string[]): Promise<void>;
  unsubscribe(symbols: string[]): Promise<void>;
  getSubscriptions(): string[];
}
