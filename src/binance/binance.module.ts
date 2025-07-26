/**
 * BinanceModule - 바이낸스 가격 데이터 모듈
 * 
 * @Module() - NestJS 모듈 데코레이터
 * imports - TcpModule, ConfigModule 가져오기
 * controllers - HTTP 요청 처리
 * providers - 비즈니스 로직 서비스
 */
import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { BinanceController } from './binance.controller';
import { TcpModule } from '../tcp/tcp.module';
import { ConfigModule } from '../config/config.module';

@Module({
  // imports - TcpModule, ConfigModule 가져오기
  imports: [TcpModule, ConfigModule],
  
  // controllers - HTTP 요청 처리
  controllers: [BinanceController],
  
  // providers - 비즈니스 로직 서비스
  providers: [BinanceService],
})
export class BinanceModule {}
