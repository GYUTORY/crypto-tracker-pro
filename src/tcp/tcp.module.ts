import { Module } from '@nestjs/common';
import { TcpService } from './tcp.service';
import { PriceStoreService } from './price-store.service';

@Module({
  providers: [TcpService, PriceStoreService],
  exports: [TcpService, PriceStoreService],
})
export class TcpModule {} 