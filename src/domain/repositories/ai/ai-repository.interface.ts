/**
 * AI 분석 서비스 인터페이스
 */
import { TechnicalData } from '../../entities/technical-analysis';
import { PricePrediction } from '../../entities/prediction';
import { TechnicalAnalysisResponse } from '../../schemas/ai.schemas';

export interface AiRepository {
  analyzeTechnicalIndicators(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<TechnicalAnalysisResponse>;
  
  predictPrice(
    symbol: string,
    currentPrice: string,
    technicalData: TechnicalData
  ): Promise<PricePrediction>;
  
  analyze(prompt: string): Promise<string>;
  
  isConnected(): boolean;
} 