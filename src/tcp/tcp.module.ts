/**
 * TcpModule - TCP 통신 관련 모듈
 * 
 * @Module() - NestJS 모듈 데코레이터
 * controllers - HTTP 요청 처리
 * providers - TCP 서버 및 데이터 관리 서비스
 * exports - 다른 모듈에서 사용할 수 있도록 서비스 내보내기
 */
import { Module } from '@nestjs/common';
import { TcpController } from './tcp.controller';
import { TcpService } from './tcp.service';
import { PriceStoreService } from './price-store.service';

@Module({
  // controllers - HTTP 요청 처리
  controllers: [TcpController],
  
  // providers - TCP 서버 및 데이터 관리 서비스
  providers: [TcpService, PriceStoreService],
  
  // exports - 다른 모듈에서 사용할 수 있도록 서비스 내보내기
  exports: [TcpService, PriceStoreService],
})
export class TcpModule {} 