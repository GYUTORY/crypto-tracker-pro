import { ApiProperty } from '@nestjs/swagger';

/**
 * 시장 통계 응답 DTO
 */
export class MarketStatsResponseDto {
  @ApiProperty({
    description: '전체 시가총액',
    example: '2.1T'
  })
  totalMarketCap: string;

  @ApiProperty({
    description: '전체 24시간 거래량',
    example: '50B'
  })
  totalVolume24h: string;

  @ApiProperty({
    description: '비트코인 지배율',
    example: '48.5%'
  })
  btcDominance: string;

  @ApiProperty({
    description: '활성 코인 수',
    example: 2000
  })
  activeCoins: number;

  @ApiProperty({
    description: '전체 시장 24시간 변동률',
    example: '+1.2%'
  })
  marketChange24h: string;

  @ApiProperty({
    description: '공포탐욕지수 (1-100)',
    example: 65
  })
  fearGreedIndex: number;

  @ApiProperty({
    description: '타임스탬프',
    example: 1703123456789
  })
  timestamp: number;
}
