/**
 * 애플리케이션 모듈
 */
import { Module } from '@nestjs/common';
import { GetPriceUseCase } from './use-cases/get-price.use-case';
import { AnalyzeTechnicalUseCase } from './use-cases/analyze-technical.use-case';
import { AnalyzeTechnicalSimpleUseCase } from './use-cases/analyze-technical-simple.use-case';
import { PredictPriceUseCase } from './use-cases/predict-price.use-case';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [
    GetPriceUseCase,
    AnalyzeTechnicalUseCase,
    AnalyzeTechnicalSimpleUseCase,
    PredictPriceUseCase
  ],
  exports: [
    GetPriceUseCase,
    AnalyzeTechnicalUseCase,
    AnalyzeTechnicalSimpleUseCase,
    PredictPriceUseCase
  ]
})
export class ApplicationModule {} 