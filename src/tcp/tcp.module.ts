/**
 * TcpModule - TCP 통신 관련 모듈
 * 
 * 이 모듈은 TCP 서버를 통해 비트코인 가격 정보를 실시간으로 받아서
 * 메모리에 저장하고 관리하는 역할을 합니다.
 * 
 * 모듈 구성:
 * - TcpService: TCP 서버 및 데이터 관리
 * - PriceStoreService: 메모리 기반 가격 저장소
 * 
 * 주요 기능:
 * - TCP 서버 생성 및 관리
 * - 실시간 비트코인 가격 데이터 수신
 * - 메모리 기반 가격 데이터 저장
 * - API 요청 시 메모리 데이터 반환
 * 
 * TCP 통신 특징:
 * - 실시간 데이터 스트리밍
 * - 연결 지속성
 * - 바이너리 데이터 처리
 * - 에러 처리 및 재연결
 */
import { Module } from '@nestjs/common';
import { TcpService } from './tcp.service';
import { PriceStoreService } from './price-store.service';

@Module({
  // TCP 서버 및 데이터 관리를 담당하는 서비스들
  providers: [TcpService, PriceStoreService],
  
  // 다른 모듈에서 사용할 수 있도록 서비스들을 내보냄
  exports: [TcpService, PriceStoreService],
})
export class TcpModule {} 