/**
 * BinanceController - 바이낸스 가격 데이터 HTTP 컨트롤러
 * 
 * 이 컨트롤러는 TCP를 통해 받은 비트코인 가격 정보를 메모리에서 조회하여
 * HTTP API로 제공하는 역할을 합니다.
 * 
 * 기본 경로: /binance
 * 
 * 주요 엔드포인트:
 * - GET /binance/price/:symbol - 특정 암호화폐의 현재 가격 조회
 * 
 * HTTP 상태 코드:
 * - 200: 성공
 * - 400: 잘못된 요청 (잘못된 심볼 등)
 * - 404: 데이터를 찾을 수 없음
 * - 500: 서버 내부 오류
 */
import { Controller, Get, Param, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { BinanceService } from './binance.service';
import { BaseResponse } from '../services/base.service';
import { BaseResponseDto } from '../dto/base-response.dto';
import { PriceResponseDto } from '../dto/price.dto';

@ApiTags('binance')
@Controller('binance') // 모든 엔드포인트는 /binance로 시작
export class BinanceController {
  /**
   * 생성자에서 BinanceService를 주입받습니다.
   * 메모리 기반 가격 데이터 조회를 담당합니다.
   */
  constructor(private readonly binanceService: BinanceService) {}


  @ApiOperation({
    summary: '암호화폐 현재 가격 조회',
    description: `
      특정 암호화폐의 현재 가격을 조회합니다.
      
      데이터 소스 우선순위:
      1. 메모리 저장소 (WebSocket을 통해 받은 실시간 데이터)
      2. 바이낸스 API (폴백, 메모리에 없을 때)
      
      지원하는 심볼:
      - BTCUSDT (비트코인)
      - ETHUSDT (이더리움)
      - 기타 바이낸스에서 지원하는 모든 심볼
      
      응답 예시:
      - 메모리에서 조회: "Price retrieved from memory for BTCUSDT"
      - API에서 조회: "Price retrieved from API for BTCUSDT"
    `
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT, ETHUSDT)',
    example: 'BTCUSDT',
    type: String,
    required: true
  })
  @ApiResponse({
    status: 200,
    description: '가격 조회 성공',
    type: BaseResponseDto,
    schema: {
      example: {
        result: true,
        msg: 'Price retrieved from memory for BTCUSDT',
        result_data: {
          symbol: 'BTCUSDT',
          price: '43250.50'
        },
        code: 'S001'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 심볼',
    type: BaseResponseDto,
    schema: {
      example: {
        result: false,
        msg: 'Invalid symbol: INVALID',
        result_data: null,
        code: 'E400'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
    type: BaseResponseDto,
    schema: {
      example: {
        result: false,
        msg: 'Failed to fetch price for BTCUSDT',
        result_data: null,
        code: 'E500'
      }
    }
  })
  @Get('price/:symbol')
  @HttpCode(HttpStatus.OK)
  async getPrice(
    @Param('symbol') symbol: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const result = await this.binanceService.getCurrentPrice(symbol.toUpperCase());
      
      // 응답 전송
      res.json(result);
    } catch (error) {
      // 예상치 못한 에러 처리
      const errorResponse: BaseResponse<null> = {
        result: false,
        msg: `Failed to get price for ${symbol}: ${error.message}`,
        result_data: null,
        code: 'E500',
      };
      
      res.status(500).json(errorResponse);
    }
  }
} 