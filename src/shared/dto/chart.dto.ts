import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 차트 데이터 조회 쿼리 DTO
 */
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

/**
 * 차트 데이터 포인트 DTO
 */
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

/**
 * 차트 데이터 응답 DTO
 */
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
