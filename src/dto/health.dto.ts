import { ApiProperty } from '@nestjs/swagger';

/**
 * 헬스체크 응답 DTO
 */
export class HealthResponseDto {
  @ApiProperty({
    description: '서버 상태',
    example: 'OK',
    type: String
  })
  status: string;

  @ApiProperty({
    description: '서버 시작 시간',
    example: '2024-01-15T10:30:00.000Z',
    type: String
  })
  timestamp: string;

  @ApiProperty({
    description: '서버 업타임 (밀리초)',
    example: 3600000,
    type: Number
  })
  uptime: number;

  @ApiProperty({
    description: '메모리 사용량 정보',
    type: 'object',
    properties: {
      used: { type: 'number', example: 52428800 },
      total: { type: 'number', example: 1073741824 },
      percentage: { type: 'number', example: 4.88 }
    }
  })
  memory: {
    used: number;
    total: number;
    percentage: number;
  };

  @ApiProperty({
    description: 'WebSocket 연결 상태',
    example: true,
    type: Boolean
  })
  websocketConnected: boolean;
}

/**
 * 환영 메시지 응답 DTO
 */
export class WelcomeResponseDto {
  @ApiProperty({
    description: 'API 버전',
    example: '1.0.0',
    type: String
  })
  version: string;

  @ApiProperty({
    description: 'API 문서 URL',
    example: 'http://localhost:3000/api-docs',
    type: String
  })
  documentation: string;
} 