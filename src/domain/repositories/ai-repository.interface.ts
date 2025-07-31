/**
 * AI 분석 서비스 인터페이스
 */
import { TechnicalAnalysis, TechnicalData } from '../entities/technical-analysis.entity';

export interface AiRepository {
  analyzeTechnicalIndicators(
    symbol: string,
    price: string,
    technicalData: TechnicalData
  ): Promise<TechnicalAnalysis>;
  isConnected(): boolean;
} 