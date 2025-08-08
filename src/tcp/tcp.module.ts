import { Module } from '@nestjs/common';
import { TcpService } from './tcp.service';
import { PriceStoreService } from './price-store.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [TcpService, PriceStoreService],
  exports: [TcpService, PriceStoreService],
})
export class TcpModule {} 