/**
 * 가격 예측 응답 DTO
 * 
 * Swagger 문서 생성을 위한 클래스입니다.
 * 실제 API 응답에서 사용되는 데이터 구조를 정의합니다.
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * 시간대별 예측 정보 DTO
 */
export class TimeframePredictionDto {
  @ApiProperty({
    description: '예측 시간대',
    example: '1h',
    enum: ['1h', '4h', '24h', '1w', '1m', '3m']
  })
  timeframe: string;

  @ApiProperty({
    description: '예측 가격',
    example: '43500000'
  })
  predictedPrice: string;

  @ApiProperty({
    description: '예측 신뢰도 (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100
  })
  confidence: number;

  @ApiProperty({
    description: '현재 대비 변화율 (%)',
    example: 0.58
  })
  changePercent: number;

  @ApiProperty({
    description: '예측 추세',
    example: 'bullish',
    enum: ['bullish', 'bearish', 'neutral']
  })
  trend: string;

  @ApiProperty({
    description: '예측 근거 설명',
    example: '단기 상승 모멘텀과 기술적 지표 개선'
  })
  explanation: string;
}

/**
 * AI 분석 결과 DTO
 */
export class PredictionAnalysisDto {
  @ApiProperty({
    description: '시장 심리',
    example: 'bullish',
    enum: ['bullish', 'bearish', 'neutral']
  })
  marketSentiment: string;

  @ApiProperty({
    description: '주요 영향 요인들',
    example: ['긍정적인 기술적 지표', '거래량 증가', '기관 투자자 관심'],
    type: [String]
  })
  keyFactors: string[];

  @ApiProperty({
    description: '위험 요인들',
    example: ['시장 변동성', '규제 불확실성', '거시경제 위험'],
    type: [String]
  })
  riskFactors: string[];

  @ApiProperty({
    description: '투자 추천',
    example: '현재 시장 상황을 보면 소량 매수 진입을 고려해볼 수 있습니다.'
  })
  recommendation: string;

  @ApiProperty({
    description: '면책 조항',
    example: '이 예측은 투자 조언이 아닙니다. 투자 결정은 본인의 판단에 따라 신중하게 이루어져야 합니다.'
  })
  disclaimer: string;
}

/**
 * 가격 예측 응답 DTO
 */
export class PredictionResponseDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCKRW'
  })
  symbol: string;

  @ApiProperty({
    description: '현재 가격',
    example: '43250000'
  })
  currentPrice: string;

  @ApiProperty({
    description: '시간대별 예측 정보',
    type: [TimeframePredictionDto]
  })
  predictions: TimeframePredictionDto[];

  @ApiProperty({
    description: '지지선들',
    example: ['43000000', '42500000', '42000000'],
    type: [String]
  })
  supportLevels: string[];

  @ApiProperty({
    description: '저항선들',
    example: ['44000000', '44500000', '45000000'],
    type: [String]
  })
  resistanceLevels: string[];

  @ApiProperty({
    description: '전체 예측 신뢰도 (0-100)',
    example: 72,
    minimum: 0,
    maximum: 100
  })
  confidence: number;

  @ApiProperty({
    description: 'AI 분석 결과',
    type: PredictionAnalysisDto
  })
  analysis: PredictionAnalysisDto;

  @ApiProperty({
    description: '예측 데이터 나이 (밀리초)',
    example: 300000,
    required: false
  })
  age?: number;
} 