/**
 * 기술적 분석 유스케이스
 */
import { Injectable, Inject } from '@nestjs/common';
import { TechnicalData } from '@/domain/entities/technical-analysis';
import { AiRepository } from '@/domain/repositories/ai';
import { TechnicalAnalysisResponse } from '@/domain/schemas/ai.schemas';
import { BaseResponse, BaseService } from '@/shared/base-response';
import Logger from '@/shared/logger';

export interface AnalyzeTechnicalRequest {
  symbol: string;
  price: string;
  technicalData: TechnicalData;
}

export interface AnalyzeTechnicalResponse {
  symbol: string;
  price: string;
  analysis: TechnicalAnalysisResponse;
}

@Injectable()
export class AnalyzeTechnicalUseCase extends BaseService {
  constructor(
    @Inject('AiRepository')
    private readonly aiRepository: AiRepository
  ) {
    super();
  }

  async execute(request: AnalyzeTechnicalRequest): Promise<BaseResponse<AnalyzeTechnicalResponse>> {
    try {
      const { symbol, price, technicalData } = request;

      // AI 분석 수행
      const analysis = await this.aiRepository.analyzeTechnicalIndicators(
        symbol,
        price,
        technicalData
      );

      return this.success({
        symbol: symbol,
        price: price,
        analysis: analysis
      }, `${symbol} 기술적 분석 완료`);

    } catch (error) {
      Logger.error(`기술적 분석 중 오류: ${error.message}`);
      return this.fail(`${request.symbol} 기술적 분석 실패`);
    }
  }
} 