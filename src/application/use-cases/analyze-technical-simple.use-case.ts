/**
 * 간단한 기술적 분석 유스케이스
 * 
 * 기존 AI 서비스들을 사용하여 기술적 분석을 수행합니다.
 */
import { Injectable, Inject } from '@nestjs/common';
import { BaseResponse, BaseService } from '../../shared/base-response';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import Logger from '../../shared/logger';

export interface AnalyzeTechnicalSimpleRequest {
  symbol: string;
}

export interface AnalyzeTechnicalSimpleResponse {
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
export class AnalyzeTechnicalSimpleUseCase extends BaseService {
  constructor(
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository,
    @Inject('AiRepository')
    private readonly aiRepository: AiRepository
  ) {
    super();
  }

  async execute(request: AnalyzeTechnicalSimpleRequest): Promise<BaseResponse<AnalyzeTechnicalSimpleResponse>> {
    try {
      const { symbol } = request;
      const upperSymbol = symbol.toUpperCase();

      // 1. 바이낸스에서 가격 데이터 가져오기
      const priceData = await this.binanceRepository.getCurrentPrice(upperSymbol);
      
      // 2. 기술적 지표 계산 (간단한 버전)
      const technicalData = {
        rsi: 50, // 임시 값
        macd: 0,
        macdSignal: 0,
        bollingerUpper: (parseFloat(priceData.price) * 1.02).toString(),
        bollingerLower: (parseFloat(priceData.price) * 0.98).toString(),
        ma20: priceData.price,
        ma50: priceData.price,
        volume: '1000000',
        volumeChange: '0'
      };

      // 3. AI 분석 수행
      const analysis = await this.aiRepository.analyzeTechnicalIndicators(
        upperSymbol,
        priceData.price,
        technicalData
      );

      return this.success({
        symbol: upperSymbol,
        price: priceData.price,
        analysis: analysis.analysis
      }, `${upperSymbol} 기술적 분석 완료`);

    } catch (error) {
      Logger.error(`기술적 분석 중 오류: ${error.message}`);
      return this.fail(`${request.symbol} 기술적 분석 실패`);
    }
  }
} 