import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { GetTradingSymbolsUseCase, GetTradingSymbolsRequest } from '@/application/use-cases/market';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';

/**
 * 거래 가능한 코인 목록 조회 DTO
 */
export class GetTradingSymbolsQueryDto {
  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

/**
 * 거래 가능한 코인 목록 응답 DTO
 */
export class TradingSymbolsResponseDto {
  symbols: string[];
  totalCount: number;
  filteredCount: number;
  categories: {
    usdt: string[];
    btc: string[];
    eth: string[];
    krw: string[];
    others: string[];
  };
  popularSymbols: string[];
  symbolNames: { [symbol: string]: string }; // 심볼별 한국어 이름
  symbolPrices: { [symbol: string]: { price: string; timestamp: number } }; // 심볼별 현재 가격
}

/**
 * 거래 가능한 코인 목록 조회 컨트롤러
 * 
 * 바이낸스에서 거래 가능한 모든 코인 목록을 조회하고,
 * 카테고리별로 분류하여 제공합니다.
 */
@ApiTags('symbols')
@Controller('symbols')
export class SymbolsController {
  constructor(
    private readonly getTradingSymbolsUseCase: GetTradingSymbolsUseCase
  ) {}

  /**
   * 거래 가능한 코인 목록 조회
   */
  @Get()
  @ApiOperation({
    summary: '거래 가능한 코인 목록 조회',
    description: '바이낸스에서 거래 가능한 모든 코인 목록을 조회하고 카테고리별로 분류하여 제공합니다.'
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: '필터링할 키워드 (예: BTC, USDT)',
    example: 'BTC'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '반환할 최대 개수',
    example: 100
  })
  @ApiResponse({
    status: 200,
    description: '거래 가능한 코인 목록 조회 성공',
    type: BaseResponseDto<TradingSymbolsResponseDto>
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async getTradingSymbols(@Query() query: GetTradingSymbolsQueryDto): Promise<BaseResponseDto<TradingSymbolsResponseDto>> {
    try {
      const request: GetTradingSymbolsRequest = {
        filter: query.filter,
        limit: query.limit ? parseInt(query.limit.toString()) : undefined
      };

      const result = await this.getTradingSymbolsUseCase.execute(request);

      return {
        result: true,
        msg: '거래 가능한 코인 목록 조회 성공',
        result_data: result,
        code: 'S001'
      };
    } catch (error) {
      throw new HttpException(
        {
          result: false,
          msg: error.message || '거래 가능한 코인 목록 조회 실패',
          result_data: null,
          code: 'E500'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 인기 코인 목록 조회
   */
  @Get('popular')
  @ApiOperation({
    summary: '인기 코인 목록 조회',
    description: '거래량 기준 인기 코인 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '인기 코인 목록 조회 성공',
    type: BaseResponseDto<{ 
      popularSymbols: string[]; 
      popularSymbolNames: { [symbol: string]: string };
      popularSymbolPrices: { [symbol: string]: { price: string; timestamp: number } };
    }>
  })
  async getPopularSymbols(): Promise<BaseResponseDto<{ 
    popularSymbols: string[]; 
    popularSymbolNames: { [symbol: string]: string };
    popularSymbolPrices: { [symbol: string]: { price: string; timestamp: number } };
  }>> {
    try {
      const result = await this.getTradingSymbolsUseCase.execute({ limit: 100 });
      
      // 인기 심볼들의 한국어 이름과 가격만 추출
      const popularSymbolNames: { [symbol: string]: string } = {};
      const popularSymbolPrices: { [symbol: string]: { price: string; timestamp: number } } = {};
      
      result.popularSymbols.forEach(symbol => {
        popularSymbolNames[symbol] = result.symbolNames[symbol] || symbol;
        popularSymbolPrices[symbol] = result.symbolPrices[symbol] || { price: '가격 정보 없음', timestamp: Date.now() };
      });
      
      return {
        result: true,
        msg: '인기 코인 목록 조회 성공',
        result_data: {
          popularSymbols: result.popularSymbols,
          popularSymbolNames,
          popularSymbolPrices
        },
        code: 'S001'
      };
    } catch (error) {
      throw new HttpException(
        {
          result: false,
          msg: error.message || '인기 코인 목록 조회 실패',
          result_data: null,
          code: 'E500'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * USDT 페어 코인 목록 조회
   */
  @Get('usdt')
  @ApiOperation({
    summary: 'USDT 페어 코인 목록 조회',
    description: 'USDT로 거래되는 코인 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: 'USDT 페어 코인 목록 조회 성공',
    type: BaseResponseDto<{ 
      usdtSymbols: string[]; 
      usdtSymbolNames: { [symbol: string]: string };
      usdtSymbolPrices: { [symbol: string]: { price: string; timestamp: number } };
    }>
  })
  async getUsdtSymbols(): Promise<BaseResponseDto<{ 
    usdtSymbols: string[]; 
    usdtSymbolNames: { [symbol: string]: string };
    usdtSymbolPrices: { [symbol: string]: { price: string; timestamp: number } };
  }>> {
    try {
      const result = await this.getTradingSymbolsUseCase.execute();
      
      // USDT 심볼들의 한국어 이름과 가격만 추출
      const usdtSymbolNames: { [symbol: string]: string } = {};
      const usdtSymbolPrices: { [symbol: string]: { price: string; timestamp: number } } = {};
      
      result.categories.usdt.forEach(symbol => {
        usdtSymbolNames[symbol] = result.symbolNames[symbol] || symbol;
        usdtSymbolPrices[symbol] = result.symbolPrices[symbol] || { price: '가격 정보 없음', timestamp: Date.now() };
      });
      
      return {
        result: true,
        msg: 'USDT 페어 코인 목록 조회 성공',
        result_data: {
          usdtSymbols: result.categories.usdt,
          usdtSymbolNames,
          usdtSymbolPrices
        },
        code: 'S001'
      };
    } catch (error) {
      throw new HttpException(
        {
          result: false,
          msg: error.message || 'USDT 페어 코인 목록 조회 실패',
          result_data: null,
          code: 'E500'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
