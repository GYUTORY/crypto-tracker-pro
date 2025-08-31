/**
 * 가격 업데이트 이벤트 리스너
 * 
 * WebSocket으로부터 수신된 가격 업데이트 이벤트를 처리하여
 * PriceRepository에 저장합니다.
 */
import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PriceUpdatedEvent } from '../../domain/events/price-updated.event';
import { PriceRepository } from '../../domain/repositories/price';
import Logger from '../../shared/logger';

@Injectable()
export class PriceUpdatedListener {
  constructor(
    @Inject('PriceRepository')
    private readonly priceRepository: PriceRepository
  ) {}

  /**
   * 가격 업데이트 이벤트 처리
   * 
   * @param event 가격 업데이트 이벤트
   */
  @OnEvent('price.updated')
  async handlePriceUpdated(event: PriceUpdatedEvent): Promise<void> {
    try {
      await this.priceRepository.save(event.price);
      Logger.info(`가격 저장 완료: ${event.price.symbol} = ${event.price.price} (${event.source})`);
    } catch (error) {
      Logger.error(`가격 저장 실패: ${event.price.symbol}`, null, { error: error.message });
    }
  }
}
