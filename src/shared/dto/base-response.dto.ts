import { ApiProperty } from '@nestjs/swagger';

/**
 * 공통 응답 데이터 모델 DTO
 * 모든 API 응답의 기본 구조를 정의합니다.
 */
export class BaseResponseDto<T = any> {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
    type: Boolean
  })
  result: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Success',
    type: String
  })
  msg: string;

  @ApiProperty({
    description: '실제 응답 데이터',
    example: {},
    additionalProperties: true
  })
  result_data: T;

  @ApiProperty({
    description: '응답 코드',
    example: 'S001',
    type: String,
    enum: ['S001', 'S002', 'E001', 'E400', 'E500']
  })
  code: string;
}

/**
 * 성공 응답 코드 상수
 */
export const SUCCESS_CODES = {
  SUCCESS: 'S001',
  NO_DATA: 'S002'
} as const;

/**
 * 에러 응답 코드 상수
 */
export const ERROR_CODES = {
  GENERAL_ERROR: 'E001',
  BAD_REQUEST: 'E400',
  INTERNAL_ERROR: 'E500'
} as const; 