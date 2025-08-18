import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, IsString, Min, Max } from 'class-validator';

/**
 * 비트코인 뉴스 조회 쿼리 DTO
 */
export class GetBitcoinNewsQueryDto {
  @ApiProperty({
    description: '캐시 무시하고 새로 크롤링',
    required: false,
    type: Boolean,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;

  @ApiProperty({
    description: '반환할 최대 개수',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100,
    example: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: '특정 소스만 필터링',
    required: false,
    type: String,
    example: 'CoinDesk'
  })
  @IsOptional()
  @IsString()
  source?: string;
}

/**
 * 뉴스 항목 DTO
 */
export class NewsItemDto {
  @ApiProperty({
    description: '뉴스 ID',
    example: 'abc123def456'
  })
  id: string;

  @ApiProperty({
    description: '뉴스 제목 (한국어 번역)',
    example: '비트코인 가격이 50,000달러를 돌파했습니다'
  })
  title: string;

  @ApiProperty({
    description: '뉴스 설명 (한국어 번역)',
    example: '비트코인 가격이 주요 저항선을 돌파하며 상승세를 보이고 있습니다.'
  })
  description: string;

  @ApiProperty({
    description: '원본 제목 (영어)',
    required: false,
    example: 'Bitcoin Price Breaks $50,000 Resistance Level'
  })
  originalTitle?: string;

  @ApiProperty({
    description: '원본 설명 (한국어 번역)',
    required: false,
    example: '비트코인 가격이 주요 저항선을 돌파하며 상승세를 보이고 있습니다.'
  })
  originalDescription?: string;

  @ApiProperty({
    description: '뉴스 URL',
    example: 'https://example.com/news/bitcoin-price-breaks-50000'
  })
  url: string;

  @ApiProperty({
    description: '뉴스 소스',
    example: 'CoinDesk'
  })
  source: string;

  @ApiProperty({
    description: '발행일',
    example: '2024-01-15T10:30:00.000Z'
  })
  publishedAt: Date;

  @ApiProperty({
    description: '이미지 URL',
    required: false,
    example: 'https://example.com/image.jpg'
  })
  imageUrl?: string;

  @ApiProperty({
    description: '감정 분석',
    required: false,
    enum: ['positive', 'negative', 'neutral'],
    example: 'positive'
  })
  sentiment?: 'positive' | 'negative' | 'neutral';

  @ApiProperty({
    description: '키워드',
    required: false,
    type: [String],
    example: ['비트코인', '가격', '상승']
  })
  keywords?: string[];
}

/**
 * 비트코인 뉴스 응답 DTO
 */
export class BitcoinNewsResponseDto {
  @ApiProperty({
    description: '뉴스 목록',
    type: [NewsItemDto]
  })
  news: NewsItemDto[];

  @ApiProperty({
    description: '총 뉴스 개수',
    example: 25
  })
  totalCount: number;

  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  lastUpdated: Date;

  @ApiProperty({
    description: '뉴스 소스 목록',
    type: [String],
    example: ['CoinDesk', 'Cointelegraph', 'Bitcoin.com']
  })
  sources: string[];
}
