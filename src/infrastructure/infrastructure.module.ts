/**
 * 인프라스트럭처 모듈
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { BinanceApiRepository } from './repositories/binance-api.repository';
import { GoogleAiRepository } from './repositories/google-ai.repository';
import { MemoryPriceRepository } from './repositories/memory-price.repository';
import { AiService } from './services/ai.service';
import { TechnicalAnalysisService } from './services/technical-analysis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'BinanceRepository',
      useClass: BinanceApiRepository,
    },
    {
      provide: 'AiRepository',
      useClass: GoogleAiRepository,
    },
    {
      provide: 'PriceRepository',
      useClass: MemoryPriceRepository,
    },
    AiService,
    TechnicalAnalysisService
  ],
  exports: [
    'BinanceRepository',
    'AiRepository',
    'PriceRepository',
    AiService,
    TechnicalAnalysisService
  ],
})
export class InfrastructureModule {} 