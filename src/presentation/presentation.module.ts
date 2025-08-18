/**
 * 프레젠테이션 모듈
 */
import { Module } from '@nestjs/common';
import { PriceController } from './controllers/price.controller';
import { PredictionController } from './controllers/prediction.controller';
import { AiController } from './controllers/ai.controller';
import { TcpController } from './controllers/tcp.controller';
import { StreamController } from './controllers/stream.controller';
import { SymbolsController } from './controllers/symbols.controller';
import { NewsController } from './controllers/news.controller';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { StreamingModule } from '../infrastructure/streaming/streaming.module';

@Module({
  imports: [
    ApplicationModule,
    InfrastructureModule,
    StreamingModule,
  ],
  controllers: [
    PriceController,
    PredictionController,
    AiController,
    TcpController,
    StreamController,
    SymbolsController,
    NewsController,
  ],
})
export class PresentationModule {} 