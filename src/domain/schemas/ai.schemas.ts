import { z } from 'zod';

/**
 * 기술적 분석 응답 스키마 (실제 AI 응답 구조에 맞춤)
 */
export const TechnicalAnalysisSchema = z.object({
  rsi: z.object({
    value: z.number(),
    signal: z.enum(['oversold', 'overbought', 'neutral']),
    explanation: z.string(),
  }),
  macd: z.object({
    value: z.number(),
    signal: z.enum(['bullish', 'bearish', 'neutral']),
    explanation: z.string(),
  }),
  bollinger: z.object({
    position: z.enum(['upper', 'middle', 'lower']),
    signal: z.enum(['breakout', 'breakdown', 'neutral']),
    explanation: z.string(),
  }),
  movingAverages: z.object({
    signal: z.enum(['bullish', 'bearish', 'neutral']),
    explanation: z.string(),
  }),
  overallSignal: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number().min(0).max(100),
  simpleAdvice: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  riskExplanation: z.string(),
});

/**
 * 가격 예측 응답 스키마 (더 유연한 구조)
 */
export const PricePredictionSchema = z.object({
  predictions: z.array(z.object({
    timeframe: z.string(), // 더 유연하게 string으로 변경
    predictedPrice: z.string(),
    confidence: z.number().min(0).max(100),
    changePercent: z.number(),
    trend: z.string(), // 더 유연하게 string으로 변경
    explanation: z.string(),
  })),
  supportLevels: z.array(z.string()).optional(), // 선택적으로 변경
  resistanceLevels: z.array(z.string()).optional(), // 선택적으로 변경
  confidence: z.number().min(0).max(100).optional(), // 선택적으로 변경
  analysis: z.object({
    marketSentiment: z.string().optional(), // 더 유연하게 변경
    keyFactors: z.array(z.string()).optional(), // 선택적으로 변경
    riskFactors: z.array(z.string()).optional(), // 선택적으로 변경
    recommendation: z.string().optional(), // 선택적으로 변경
    disclaimer: z.string().optional(), // 선택적으로 변경
  }).optional(), // 전체 analysis 객체를 선택적으로 변경
}).passthrough(); // 추가 속성 허용

/**
 * AI 응답 공통 스키마
 */
export const AIResponseSchema = z.union([
  TechnicalAnalysisSchema,
  PricePredictionSchema,
]);

/**
 * AI 응답 타입 정의
 */
export type TechnicalAnalysisResponse = z.infer<typeof TechnicalAnalysisSchema>;
export type PricePredictionResponse = z.infer<typeof PricePredictionSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
