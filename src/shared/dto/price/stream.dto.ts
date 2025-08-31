import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional } from 'class-validator';

/**
 * 구독 요청 DTO
 */
export class SubscribeRequestDto {
  @ApiProperty({
    description: '구독할 암호화폐 심볼들',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];
}

/**
 * 구독 해제 요청 DTO
 */
export class UnsubscribeRequestDto {
  @ApiProperty({
    description: '구독 해제할 암호화폐 심볼들',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];
}

/**
 * 스트림 상태 응답 DTO
 */
export class StreamStatusResponseDto {
  @ApiProperty({
    description: '연결 상태',
    example: true,
    type: Boolean
  })
  isConnected: boolean;

  @ApiProperty({
    description: '현재 구독 중인 심볼들',
    example: ['BTCUSDT', 'ETHUSDT'],
    type: [String]
  })
  subscriptions: string[];
}
