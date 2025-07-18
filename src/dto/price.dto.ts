import { ApiProperty } from '@nestjs/swagger';

/**
 * 가격 데이터 DTO
 */
export class PriceDataDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT',
    type: String
  })
  symbol: string;

  @ApiProperty({
    description: '현재 가격',
    example: '43250.50',
    type: String
  })
  price: string;

  @ApiProperty({
    description: '타임스탬프 (밀리초)',
    example: 1703123456789,
    type: Number
  })
  timestamp: number;

  @ApiProperty({
    description: '거래량',
    example: '1234.56',
    type: String,
    required: false
  })
  volume?: string;

  @ApiProperty({
    description: '24시간 가격 변화',
    example: '1250.30',
    type: String,
    required: false
  })
  change24h?: string;

  @ApiProperty({
    description: '24시간 가격 변화율 (%)',
    example: '2.95',
    type: String,
    required: false
  })
  changePercent24h?: string;
}

/**
 * 가격 조회 요청 DTO
 */
export class GetPriceDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT',
    type: String,
    enum: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']
  })
  symbol: string;
}

/**
 * 가격 조회 응답 DTO
 */
export class PriceResponseDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT',
    type: String
  })
  symbol: string;

  @ApiProperty({
    description: '현재 가격',
    example: '43250.50',
    type: String
  })
  price: string;
}

/**
 * WebSocket 연결 상태 DTO
 */
export class ConnectionStatusDto {
  @ApiProperty({
    description: 'WebSocket 연결 상태',
    example: true,
    type: Boolean
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'WebSocket URL',
    example: 'wss://stream.binance.com:9443/ws',
    type: String
  })
  url: string;

  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2024-01-15T10:30:00.000Z',
    type: String
  })
  lastUpdate: string;
}

/**
 * 메모리 정보 DTO
 */
export class MemoryInfoDto {
  @ApiProperty({
    description: '저장된 가격 데이터 개수',
    example: 5,
    type: Number
  })
  priceCount: number;

  @ApiProperty({
    description: '저장된 심볼 목록',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  symbols: string[];

  @ApiProperty({
    description: '데이터 유효성 시간 (밀리초)',
    example: 30000,
    type: Number
  })
  validityDuration: number;
} 