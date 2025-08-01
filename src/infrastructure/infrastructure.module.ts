/**
 * 인프라스트럭처 모듈
 */
import { Module } from '@nestjs/common';
import { MemoryPriceRepository } from './repositories/memory-price.repository';
import { BinanceApiRepository } from './repositories/binance-api.repository';
import { GoogleAiRepository } from './repositories/google-ai.repository';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PriceRepository',
      useClass: MemoryPriceRepository
    },
    {
      provide: 'BinanceRepository',
      useClass: BinanceApiRepository
    },
    {
      provide: 'AiRepository',
      useClass: GoogleAiRepository
    }
  ],
  exports: [
    'PriceRepository',
    'BinanceRepository',
    'AiRepository'
  ]
})
export class InfrastructureModule {} 