/**
 * 가격 업데이트 도메인 이벤트
 * 
 * WebSocket으로부터 새로운 가격 데이터가 수신되었을 때 발행되는 이벤트입니다.
 * 이벤트 기반 아키텍처를 통해 느슨한 결합을 구현합니다.
 */
import { Price } from '../entities/price.entity';

export class PriceUpdatedEvent {
  constructor(
    public readonly price: Price,
    public readonly source: 'websocket' | 'api',
    public readonly timestamp: Date = new Date()
  ) {}
}
