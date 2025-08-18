/**
 * 메인 애플리케이션 모듈
 */
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분
        limit: 100, // 1분당 100회 요청 제한
      },
      {
        ttl: 3600000, // 1시간
        limit: 1000, // 1시간당 1000회 요청 제한
      },
    ]),
    PresentationModule,
  ],
})
export class AppModule {} 