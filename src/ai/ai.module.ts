import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, TechnicalAnalysisService],
  exports: [AiService, TechnicalAnalysisService],
})
export class AiModule {} 