/**
 * AppModule - 메인 애플리케이션 모듈
 * 
 * @Module() - NestJS 모듈 데코레이터
 * imports - 다른 모듈들을 가져와서 사용
 * controllers - HTTP 요청을 처리하는 컨트롤러들
 * providers - 비즈니스 로직을 담당하는 서비스들
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceModule } from './binance/binance.module';
import { TcpModule } from './tcp/tcp.module';
import { ConfigModule } from './config/config.module';
import { AiModule } from './ai/ai.module';

@Module({
  // imports - 다른 모듈들을 가져와서 사용 (의존성 주입)
  imports: [ConfigModule, BinanceModule, TcpModule, AiModule],
  
  // controllers - HTTP 요청을 처리하는 컨트롤러들
  controllers: [AppController],
  
  // providers - 비즈니스 로직을 담당하는 서비스들
  providers: [AppService],
})
export class AppModule {} 