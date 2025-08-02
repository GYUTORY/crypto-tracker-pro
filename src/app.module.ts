/**
 * 메인 애플리케이션 모듈
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PresentationModule } from './presentation/presentation.module';
import { TcpModule } from './tcp/tcp.module';

@Module({
  imports: [
    ConfigModule,
    PresentationModule,
    TcpModule
  ],
})
export class AppModule {} 