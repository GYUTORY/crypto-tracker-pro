import { IsString, IsOptional, IsBoolean, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 가격 조회 요청 DTO
 */
export class GetPriceRequestDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT',
    required: true
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: '강제 새로고침 여부',
    example: false,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}

/**
 * 가격 조회 응답 DTO
 */
export class GetPriceResponseDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT'
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: '현재 가격',
    example: '43250.50'
  })
  @IsString()
  price: string;

  @ApiProperty({
    description: '데이터 소스',
    example: 'memory',
    enum: ['memory', 'api']
  })
  @IsString()
  source: 'memory' | 'api';

  @ApiProperty({
    description: '데이터 나이 (밀리초)',
    example: 5000,
    required: false
  })
  @IsOptional()
  age?: number;
}

/**
 * 스트림 구독 요청 DTO
 */
export class SubscribeRequestDto {
  @ApiProperty({
    description: '구독할 심볼 목록',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  symbols: string[];
}

/**
 * 스트림 구독 해제 요청 DTO
 */
export class UnsubscribeRequestDto {
  @ApiProperty({
    description: '구독 해제할 심볼 목록',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  symbols: string[];
}

/**
 * 스트림 상태 응답 DTO
 */
export class StreamStatusResponseDto {
  @ApiProperty({
    description: 'WebSocket 연결 상태',
    example: true
  })
  isConnected: boolean;

  @ApiProperty({
    description: '현재 구독 중인 심볼 목록',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  subscriptions: string[];
}
