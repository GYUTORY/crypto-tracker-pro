/**
 * AI 분석 서비스 인터페이스
 */
import { TechnicalData } from '../entities/technical-analysis.entity';
import { PricePrediction } from '../entities/price-prediction.entity';
import { TechnicalAnalysisResponse } from '../schemas/ai.schemas';

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