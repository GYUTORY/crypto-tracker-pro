/**
 * ConfigModule - 설정 관리 모듈
 * 
 * @Global() - 전역 모듈로 설정 (모든 모듈에서 사용 가능)
 * @Module() - NestJS 모듈 데코레이터
 * providers - 설정 서비스 제공
 * exports - 다른 모듈에서 사용할 수 있도록 서비스 내보내기
 */
import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({
  // providers - 설정 서비스 제공
  providers: [ConfigService],
  
  // exports - 다른 모듈에서 사용할 수 있도록 서비스 내보내기
  exports: [ConfigService],
})
export class ConfigModule {} 