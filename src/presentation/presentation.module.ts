/**
 * 프레젠테이션 모듈
 */
import { Module } from '@nestjs/common';
import { PriceController } from './controllers/price.controller';
import { AiController } from './controllers/ai.controller';
import { BinanceController } from './controllers/binance.controller';
import { TcpController } from './controllers/tcp.controller';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TcpModule } from '../tcp/tcp.module';

@Module({
  imports: [
    ApplicationModule,
    InfrastructureModule,
    TcpModule
  ],
  controllers: [
    PriceController,
    AiController,
    BinanceController,
    TcpController
  ],
  exports: []
})
export class PresentationModule {} 