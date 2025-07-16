import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceModule } from './binance/binance.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [BinanceModule, WebsocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 