import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimeframeType {
  SHORT_TERM = 'short_term', // 단기 (1-7일)
  MEDIUM_TERM = 'medium_term', // 중기 (1-4주)
  LONG_TERM = 'long_term' // 장기 (1-12개월)
}

export enum RecommendationReason {
  TECHNICAL_BREAKOUT = 'technical_breakout',
  FUNDAMENTAL_STRENGTH = 'fundamental_strength',
  MARKET_SENTIMENT = 'market_sentiment',
  VOLUME_SPIKE = 'volume_spike',
  NEWS_POSITIVE = 'news_positive',
  INSTITUTIONAL_INTEREST = 'institutional_interest',
  ECOSYSTEM_GROWTH = 'ecosystem_growth',
  REGULATORY_CLARITY = 'regulatory_clarity'
}

/**
 * 추천 근거 DTO
 */
export class RecommendationReasonDto {
  @ApiProperty({ description: '근거 타입', enum: RecommendationReason })
  @IsEnum(RecommendationReason)
  type: RecommendationReason;

  @ApiProperty({ description: '근거 설명' })
  @IsString()
  description: string;

  @ApiProperty({ description: '신뢰도 점수 (0-100)' })
  @IsNumber()
  confidence: number;

  @ApiProperty({ description: '관련 데이터' })
  @IsString()
  data?: string;
}

/**
 * 추천 코인 DTO
 */
export class RecommendedCoinDto {
  @ApiProperty({ description: '코인 심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '코인 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '현재 가격' })
  @IsNumber()
  currentPrice: number;

  @ApiProperty({ description: '24시간 변동률 (%)' })
  @IsNumber()
  change24h: number;

  @ApiProperty({ description: '예상 수익률 (%)' })
  @IsNumber()
  expectedReturn: number;

  @ApiProperty({ description: '위험도 점수 (1-10, 1이 가장 안전)' })
  @IsNumber()
  riskScore: number;

  @ApiProperty({ description: '추천 점수 (0-100)' })
  @IsNumber()
  recommendationScore: number;

  @ApiProperty({ description: '추천 근거들', type: [RecommendationReasonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationReasonDto)
  reasons: RecommendationReasonDto[];

  @ApiProperty({ description: 'AI 분석 요약' })
  @IsString()
  analysis: string;

  @ApiProperty({ description: '목표 가격' })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({ description: '손절가' })
  @IsNumber()
  stopLoss: number;
}

/**
 * 코인 추천 응답 DTO
 */
export class CoinRecommendationResponseDto {
  @ApiProperty({ description: '타임프레임 타입', enum: TimeframeType })
  @IsEnum(TimeframeType)
  timeframe: TimeframeType;

  @ApiProperty({ description: '타임프레임 설명' })
  @IsString()
  timeframeDescription: string;

  @ApiProperty({ description: '추천 코인 목록', type: [RecommendedCoinDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedCoinDto)
  recommendations: RecommendedCoinDto[];

  @ApiProperty({ description: '생성 시간' })
  @IsString()
  generatedAt: string;

  @ApiProperty({ description: 'AI 모델 정보' })
  @IsString()
  modelInfo: string;

  @ApiProperty({ description: '전체 시장 분석' })
  @IsString()
  marketAnalysis: string;
}

/**
 * 모든 타임프레임 추천 응답 DTO
 */
export class AllRecommendationsResponseDto {
  @ApiProperty({ description: '단기 추천', type: CoinRecommendationResponseDto })
  shortTerm: CoinRecommendationResponseDto;

  @ApiProperty({ description: '중기 추천', type: CoinRecommendationResponseDto })
  mediumTerm: CoinRecommendationResponseDto;

  @ApiProperty({ description: '장기 추천', type: CoinRecommendationResponseDto })
  longTerm: CoinRecommendationResponseDto;

  @ApiProperty({ description: '전체 시장 상태' })
  @IsString()
  overallMarketStatus: string;

  @ApiProperty({ description: '생성 시간' })
  @IsString()
  generatedAt: string;
}




