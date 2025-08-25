import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ChartInterval {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M'
}

export enum IndicatorType {
  RSI = 'RSI',
  MACD = 'MACD',
  BOLLINGER_BANDS = 'Bollinger_Bands',
  MOVING_AVERAGE = 'Moving_Average'
}

export enum DrawingType {
  TRENDLINE = 'trendline',
  FIBONACCI = 'fibonacci',
  SUPPORT_RESISTANCE = 'support_resistance',
  ANNOTATION = 'annotation'
}

export enum MovingAverageType {
  SMA = 'sma',
  EMA = 'ema',
  WMA = 'wma'
}

// 기존 차트 데이터 조회 쿼리 DTO
export class GetChartDataQueryDto {
  @ApiProperty({
    description: '시간 단위',
    required: false,
    enum: ['1h', '4h', '1d', '1w'],
    example: '1h',
    default: '1h'
  })
  @IsOptional()
  @IsString()
  timeframe?: string;

  @ApiProperty({
    description: '데이터 포인트 수',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100,
    example: 24,
    default: 24
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// 기존 차트 데이터 포인트 DTO
export class ChartDataPointDto {
  @ApiProperty({
    description: '타임스탬프',
    example: 1703123400000
  })
  timestamp: number;

  @ApiProperty({
    description: '가격',
    example: '113950.00'
  })
  price: string;

  @ApiProperty({
    description: '거래량',
    example: '1000000'
  })
  volume: string;

  @ApiProperty({
    description: '고가',
    example: '114000.00'
  })
  high: string;

  @ApiProperty({
    description: '저가',
    example: '113800.00'
  })
  low: string;
}

// 기존 차트 데이터 응답 DTO
export class ChartDataResponseDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT'
  })
  symbol: string;

  @ApiProperty({
    description: '시간 단위',
    example: '1h'
  })
  timeframe: string;

  @ApiProperty({
    description: '차트 데이터 포인트들',
    type: [ChartDataPointDto]
  })
  data: ChartDataPointDto[];
}

// OHLCV 데이터 DTO
export class OHLCVDataDto {
  @ApiProperty({ description: '타임스탬프 (밀리초)' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: '시가' })
  @IsNumber()
  open: number;

  @ApiProperty({ description: '고가' })
  @IsNumber()
  high: number;

  @ApiProperty({ description: '저가' })
  @IsNumber()
  low: number;

  @ApiProperty({ description: '종가' })
  @IsNumber()
  close: number;

  @ApiProperty({ description: '거래량' })
  @IsNumber()
  volume: number;
}

// OHLCV 응답 DTO
export class OHLCVResponseDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '차트 간격', enum: ChartInterval })
  @IsEnum(ChartInterval)
  interval: ChartInterval;

  @ApiProperty({ description: 'OHLCV 데이터 배열', type: [OHLCVDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OHLCVDataDto)
  data: OHLCVDataDto[];

  @ApiProperty({ description: '페이지네이션 정보' })
  @IsObject()
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// OHLCV 쿼리 DTO
export class OHLCVQueryDto {
  @ApiProperty({ description: '차트 간격', enum: ChartInterval, required: false })
  @IsOptional()
  @IsEnum(ChartInterval)
  interval?: ChartInterval = ChartInterval.ONE_HOUR;

  @ApiProperty({ description: '시작 시간 (ISO 8601)', required: false })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiProperty({ description: '종료 시간 (ISO 8601)', required: false })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiProperty({ description: '최대 데이터 포인트 수', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 1000;
}

// RSI 데이터 DTO
export class RSIDataDto {
  @ApiProperty({ description: '타임스탬프' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: 'RSI 값' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: '과매수 기준선' })
  @IsNumber()
  overbought: number;

  @ApiProperty({ description: '과매도 기준선' })
  @IsNumber()
  oversold: number;
}

// RSI 응답 DTO
export class RSIResponseDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '지표명' })
  @IsString()
  indicator: string;

  @ApiProperty({ description: 'RSI 파라미터' })
  @IsObject()
  parameters: {
    period: number;
  };

  @ApiProperty({ description: 'RSI 데이터 배열', type: [RSIDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RSIDataDto)
  data: RSIDataDto[];
}

// MACD 데이터 DTO
export class MACDDataDto {
  @ApiProperty({ description: '타임스탬프' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: 'MACD 라인' })
  @IsNumber()
  macd: number;

  @ApiProperty({ description: '시그널 라인' })
  @IsNumber()
  signal: number;

  @ApiProperty({ description: '히스토그램' })
  @IsNumber()
  histogram: number;
}

// MACD 응답 DTO
export class MACDResponseDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '지표명' })
  @IsString()
  indicator: string;

  @ApiProperty({ description: 'MACD 파라미터' })
  @IsObject()
  parameters: {
    fast_period: number;
    slow_period: number;
    signal_period: number;
  };

  @ApiProperty({ description: 'MACD 데이터 배열', type: [MACDDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MACDDataDto)
  data: MACDDataDto[];
}

// 볼린저 밴드 데이터 DTO
export class BollingerBandsDataDto {
  @ApiProperty({ description: '타임스탬프' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: '상단 밴드' })
  @IsNumber()
  upper: number;

  @ApiProperty({ description: '중간 밴드' })
  @IsNumber()
  middle: number;

  @ApiProperty({ description: '하단 밴드' })
  @IsNumber()
  lower: number;
}

// 볼린저 밴드 응답 DTO
export class BollingerBandsResponseDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '지표명' })
  @IsString()
  indicator: string;

  @ApiProperty({ description: '볼린저 밴드 파라미터' })
  @IsObject()
  parameters: {
    period: number;
    std_dev: number;
  };

  @ApiProperty({ description: '볼린저 밴드 데이터 배열', type: [BollingerBandsDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BollingerBandsDataDto)
  data: BollingerBandsDataDto[];
}

// 이동평균 데이터 DTO
export class MovingAverageDataDto {
  @ApiProperty({ description: '타임스탬프' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: '이동평균 값' })
  @IsNumber()
  value: number;
}

// 이동평균 응답 DTO
export class MovingAverageResponseDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '지표명' })
  @IsString()
  indicator: string;

  @ApiProperty({ description: '이동평균 파라미터' })
  @IsObject()
  parameters: {
    period: number;
    type: MovingAverageType;
  };

  @ApiProperty({ description: '이동평균 데이터 배열', type: [MovingAverageDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovingAverageDataDto)
  data: MovingAverageDataDto[];
}

// 드로잉 도구 좌표 DTO
export class DrawingCoordinatesDto {
  @ApiProperty({ description: '시작점' })
  @IsObject()
  start: { x: number; y: number };

  @ApiProperty({ description: '종료점' })
  @IsObject()
  end: { x: number; y: number };
}

// 드로잉 도구 스타일 DTO
export class DrawingStyleDto {
  @ApiProperty({ description: '색상' })
  @IsString()
  color: string;

  @ApiProperty({ description: '선 두께' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: '선 스타일' })
  @IsString()
  style: string;
}

// 드로잉 도구 메타데이터 DTO
export class DrawingMetadataDto {
  @ApiProperty({ description: '라벨' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '사용자 ID' })
  @IsOptional()
  @IsString()
  userId?: string;
}

// 드로잉 도구 생성 DTO
export class CreateDrawingDto {
  @ApiProperty({ description: '드로잉 도구 타입', enum: DrawingType })
  @IsEnum(DrawingType)
  type: DrawingType;

  @ApiProperty({ description: '좌표 정보' })
  @ValidateNested()
  @Type(() => DrawingCoordinatesDto)
  coordinates: DrawingCoordinatesDto;

  @ApiProperty({ description: '스타일 정보' })
  @ValidateNested()
  @Type(() => DrawingStyleDto)
  style: DrawingStyleDto;

  @ApiProperty({ description: '메타데이터' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DrawingMetadataDto)
  metadata?: DrawingMetadataDto;
}

// 드로잉 도구 응답 DTO
export class DrawingResponseDto {
  @ApiProperty({ description: '드로잉 도구 ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '드로잉 도구 타입', enum: DrawingType })
  @IsEnum(DrawingType)
  type: DrawingType;

  @ApiProperty({ description: '좌표 정보' })
  @ValidateNested()
  @Type(() => DrawingCoordinatesDto)
  coordinates: DrawingCoordinatesDto;

  @ApiProperty({ description: '스타일 정보' })
  @ValidateNested()
  @Type(() => DrawingStyleDto)
  style: DrawingStyleDto;

  @ApiProperty({ description: '메타데이터' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DrawingMetadataDto)
  metadata?: DrawingMetadataDto;

  @ApiProperty({ description: '생성 시간' })
  @IsString()
  created_at: string;

  @ApiProperty({ description: '수정 시간' })
  @IsString()
  updated_at: string;
}

// 드로잉 도구 조회 응답 DTO
export class DrawingsResponseDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '드로잉 도구 배열', type: [DrawingResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingResponseDto)
  drawings: DrawingResponseDto[];
}

// 차트 설정 인디케이터 DTO
export class ChartIndicatorDto {
  @ApiProperty({ description: '인디케이터 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '활성화 여부' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: '인디케이터 파라미터' })
  @IsObject()
  parameters: Record<string, any>;
}

// 차트 설정 DTO
export class ChartSettingsDto {
  @ApiProperty({ description: '심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: '차트 간격', enum: ChartInterval })
  @IsEnum(ChartInterval)
  interval: ChartInterval;

  @ApiProperty({ description: '인디케이터 설정', type: [ChartIndicatorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChartIndicatorDto)
  indicators: ChartIndicatorDto[];

  @ApiProperty({ description: '드로잉 도구 설정' })
  @IsObject()
  drawings: {
    enabled: boolean;
    auto_save: boolean;
  };

  @ApiProperty({ description: '테마' })
  @IsString()
  theme: string;

  @ApiProperty({ description: '레이아웃 설정' })
  @IsObject()
  layout: {
    chart_type: string;
    timezone: string;
  };
}
