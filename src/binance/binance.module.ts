/**
 * BinanceModule - 바이낸스 가격 데이터 모듈
 * 
 * 이 모듈은 TCP를 통해 받은 비트코인 가격 정보를 메모리에서 조회하여
 * API 요청에 응답하는 기능을 제공합니다.
 * 
 * 모듈 구성:
 * - BinanceController: 바이낸스 가격 데이터 HTTP 엔드포인트 제공
 * - BinanceService: 메모리 기반 가격 데이터 조회 및 폴백 API 호출
 * 
 * 주요 기능:
 * - TCP 서버로부터 받은 실시간 가격 데이터 제공
 * - 메모리 기반 빠른 응답
 * - 바이낸스 API 폴백 지원
 * - 데이터 유효성 검증
 * 
 * 데이터 흐름:
 * 1. TCP 클라이언트 → TCP 서버 → 메모리 저장
 * 2. API 요청 → 메모리 조회 → 응답
 * 3. 메모리에 없으면 → 바이낸스 API 호출 → 메모리 저장 → 응답
 */
import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { BinanceController } from './binance.controller';
import { TcpModule } from '../tcp/tcp.module';

@Module({
  // TCP 모듈을 가져와서 PriceStoreService 사용
  imports: [TcpModule],
  
  // 바이낸스 가격 데이터 HTTP 요청을 처리하는 컨트롤러
  controllers: [BinanceController],
  
  // 메모리 기반 가격 데이터 조회를 담당하는 서비스
  providers: [BinanceService],
})
export class BinanceModule {}
