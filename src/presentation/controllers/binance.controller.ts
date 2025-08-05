/**
 * BinanceController - 바이낸스 가격 데이터 HTTP 컨트롤러
 * 
 * @Controller('binance') - /binance 경로로 시작하는 컨트롤러
 * @Get('price/:symbol') - GET 요청 처리
 * @Param() - URL 파라미터 추출
 * @Res() - Express Response 객체 주입
 */
import { Controller, Get, Param, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { GetPriceUseCase } from '../../application/use-cases/get-price.use-case';
import { BaseResponse } from '../../shared/base-response';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';

@ApiTags('binance')
@Controller('binance') // 모든 엔드포인트는 /binance로 시작
export class BinanceController {
  // constructor - 의존성 주입 (DI)
  constructor(private readonly getPriceUseCase: GetPriceUseCase) {}

  // @Get('price/:symbol') - GET 요청 처리 (경로 파라미터)
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
      const recordSet = await this.getPriceUseCase.execute({
        symbol: symbol.toUpperCase(),
        forceRefresh: false
      });
      
      // 응답 전송
      res.json(recordSet);
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