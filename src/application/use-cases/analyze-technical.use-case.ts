/**
 * 기술적 분석 유스케이스
 */
import { Injectable, Inject } from '@nestjs/common';
import { TechnicalAnalysis, TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { BaseResponse, BaseService } from '../../shared/base-response';
import Logger from '../../shared/logger';

export interface AnalyzeTechnicalRequest {
  symbol: string;
  price: string;
  technicalData: TechnicalData;
}

export interface AnalyzeTechnicalResponse {
  symbol: string;
  price: string;
  analysis: {
    rsi: {
      value: number;
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    macd: {
      value: number;
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    bollinger: {
      position: 'upper' | 'middle' | 'lower';
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    movingAverages: {
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    overallSignal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    simpleAdvice: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskExplanation: string;
  };
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
        symbol: analysis.symbol,
        price: analysis.price,
        analysis: analysis.analysis
      }, `${symbol} 기술적 분석 완료`);

    } catch (error) {
      Logger.error(`기술적 분석 중 오류: ${error.message}`);
      return this.fail(`${request.symbol} 기술적 분석 실패`);
    }
  }
} 