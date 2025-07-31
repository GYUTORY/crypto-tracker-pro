import { ApiProperty } from '@nestjs/swagger';

/**
 * 가격 응답 DTO (Data Transfer Object)
 * 
 * API 응답에서 가격 정보를 전달할 때 사용하는 데이터 구조입니다.
 * Swagger 데코레이터를 사용하여 API 문서에 자동으로 스키마가 생성되며,
 * 클라이언트가 응답 구조를 쉽게 이해할 수 있도록 도와줍니다.
 */
export class PriceResponseDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT',
    type: String
  })
  symbol: string;

  @ApiProperty({
    description: '현재 가격 (문자열로 전달하여 정밀도 보장)',
    example: '43250.50',
    type: String
  })
  price: string;

  @ApiProperty({
    description: '데이터 소스 - 메모리에서 가져온 데이터인지 API에서 가져온 데이터인지 구분',
    enum: ['memory', 'api'],
    example: 'memory',
    type: String
  })
  source: 'memory' | 'api';

  @ApiProperty({
    description: '데이터 나이 (밀리초) - 메모리에서 가져온 데이터의 경우에만 제공',
    example: 5000,
    required: false,
    type: Number
  })
  age?: number;
} 