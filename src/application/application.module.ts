/**
 * 애플리케이션 모듈
 */
import { Module } from '@nestjs/common';
import { GetPriceUseCase } from './use-cases/get-price.use-case';
import { AnalyzeTechnicalUseCase } from './use-cases/analyze-technical.use-case';
import { AnalyzeTechnicalSimpleUseCase } from './use-cases/analyze-technical-simple.use-case';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [
    GetPriceUseCase,
    AnalyzeTechnicalUseCase,
    AnalyzeTechnicalSimpleUseCase
  ],
  exports: [
    GetPriceUseCase,
    AnalyzeTechnicalUseCase,
    AnalyzeTechnicalSimpleUseCase
  ]
})
export class ApplicationModule {} 