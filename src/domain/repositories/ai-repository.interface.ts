/**
 * AI 분석 서비스 인터페이스
 */
import { TechnicalAnalysis, TechnicalData } from '../entities/technical-analysis.entity';
import { PricePrediction } from '../entities/price-prediction.entity';

export interface AiRepository {
  analyzeTechnicalIndicators(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<TechnicalAnalysis>;
  
  predictPrice(
    symbol: string,
    currentPrice: string,
    technicalData: TechnicalData
  ): Promise<PricePrediction>;
  
  isConnected(): boolean;
} 