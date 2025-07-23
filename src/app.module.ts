/**
 * AppModule - 메인 애플리케이션 모듈
 * 
 * NestJS에서 @Module 데코레이터는 클래스를 모듈로 정의합니다.
 * 모듈은 애플리케이션의 구조를 구성하는 기본 단위입니다.
 * 
 * 모듈의 구성 요소:
 * - imports: 다른 모듈들을 가져와서 사용 (의존성 주입)
 * - controllers: HTTP 요청을 처리하는 컨트롤러들
 * - providers: 서비스, 팩토리, 헬퍼 등 비즈니스 로직을 담당하는 클래스들
 * - exports: 다른 모듈에서 사용할 수 있도록 내보내는 프로바이더들
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceModule } from './binance/binance.module';
import { TcpModule } from './tcp/tcp.module';
import { ConfigModule } from './config/config.module';

@Module({
  /**
   * imports: 다른 모듈들을 가져와서 사용 (의존성 주입)
   * 
   * 역할:
   * - 다른 모듈에서 제공하는 서비스들을 현재 모듈에서 사용할 수 있게 함
   * - 모듈 간의 의존성을 관리하고 결합도를 낮춤
   * - 각 모듈의 기능을 조합하여 전체 애플리케이션을 구성
   */
  imports: [ConfigModule, BinanceModule, TcpModule],
  
  /**
   * controllers: HTTP 요청을 처리하는 컨트롤러들
   * 
   * 역할:
   * - 클라이언트의 HTTP 요청(GET, POST, PUT, DELETE 등)을 받음
   * - 요청의 URL 경로, HTTP 메서드, 파라미터를 분석
   * - 적절한 서비스(provider)를 호출하여 비즈니스 로직 실행
   * - 서비스의 결과를 HTTP 응답으로 변환하여 클라이언트에게 반환
   * 
   * 현재 등록된 컨트롤러:
   * - AppController: 애플리케이션의 기본 엔드포인트들
   *   * GET /: 루트 경로 (애플리케이션 상태 확인)
   *   * GET /health: 헬스 체크 엔드포인트
   *   * GET /price/btc: 비트코인 현재 가격 조회
   *   * GET /price/btc/history: 비트코인 가격 히스토리 조회
   */
  controllers: [AppController],
  
  /**
   * providers: 비즈니스 로직을 담당하는 서비스들
   * 
   * 역할:
   * - 실제 비즈니스 로직을 구현하는 클래스들
   * - 데이터베이스 조작, 외부 API 호출, 데이터 처리 등
   * - 컨트롤러에서 호출되어 실제 작업을 수행
   * - NestJS의 의존성 주입(DI) 컨테이너에 의해 관리됨
   * 
   * 현재 등록된 프로바이더:
   * - AppService: 애플리케이션의 기본 비즈니스 로직
   *   * 애플리케이션 상태 확인
   *   * 헬스 체크 로직
   *   * 기본적인 애플리케이션 정보 제공
   * 
   * 참고: BinanceService, TcpService, PriceStoreService 등은
   * 각각 BinanceModule, TcpModule에서 제공되므로 여기에 직접 등록하지 않음
   */
  providers: [AppService],
})
export class AppModule {} 