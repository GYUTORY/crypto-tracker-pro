/**
 * 스트리밍 모듈
 * 
 * WebSocket 연결과 실시간 데이터 스트리밍을 관리합니다.
 */
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BinanceStreamingRepository } from './binance-streaming.repository';
import { PriceUpdatedListener } from '../listeners/price-updated.listener';
import { InfrastructureModule } from '../infrastructure.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    InfrastructureModule, // PriceRepository를 사용하기 위해 InfrastructureModule import
  ],
  providers: [
    {
      provide: 'StreamingRepository',
      useClass: BinanceStreamingRepository,
    },
    PriceUpdatedListener,
  ],
  exports: ['StreamingRepository'],
})
export class StreamingModule {}
