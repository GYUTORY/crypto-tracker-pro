/**
 * 프레젠테이션 모듈
 */
import { Module } from '@nestjs/common';
import { PriceController } from './controllers/price.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [
    PriceController
  ]
})
export class PresentationModule {} 