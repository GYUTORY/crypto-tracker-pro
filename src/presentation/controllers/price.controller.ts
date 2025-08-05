/**
 * 가격 조회 컨트롤러
 * 
 * HTTP 요청을 받아서 가격 조회 유스케이스를 호출하는 프레젠테이션 레이어입니다.
 * Swagger 데코레이터를 사용하여 API 문서를 자동으로 생성하고,
 * 클라이언트가 쉽게 API를 이해하고 사용할 수 있도록 도와줍니다.
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetPriceUseCase } from '../../application/use-cases/get-price.use-case';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { PriceResponseDto } from '../../shared/dto/price-response.dto';

/**
 * 가격 관련 API 그룹
 * Swagger UI에서 이 태그로 API들을 그룹화하여 표시합니다.
 */
@ApiTags('price')
@Controller('price')
export class PriceController {
  constructor(
    private readonly getPriceUseCase: GetPriceUseCase
  ) {}

  /**
   * 암호화폐 가격 조회 API
   * 
   * 특정 암호화폐의 현재 가격을 조회합니다. 메모리 캐시를 우선적으로 확인하고,
   * 캐시에 없거나 만료된 경우 바이낸스 API에서 최신 데이터를 가져옵니다.
   * 
   * @param symbol 조회할 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
   * @param forceRefresh 강제 새로고침 여부 (기본값: false)
   * @returns 가격 정보와 데이터 소스 정보
   */
  @Get(':symbol')
  @ApiOperation({
    summary: '암호화폐 가격 조회',
    description: '특정 암호화폐의 현재 가격을 조회합니다. 메모리에서 먼저 조회하고, 없으면 API에서 가져옵니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT, ETHUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'forceRefresh',
    description: '강제 새로고침 여부',
    required: false,
    type: Boolean
  })
  @ApiResponse({
    status: 200,
    description: '가격 조회 성공',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 심볼'
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async getPrice(
    @Param('symbol') symbol: string,
    @Query('forceRefresh') forceRefresh?: boolean
  ): Promise<BaseResponseDto<PriceResponseDto>> {
    // 유스케이스를 호출하여 비즈니스 로직 실행
    const recordSet = await this.getPriceUseCase.execute({
      symbol,
      forceRefresh: forceRefresh === true
    });

    return recordSet;
  }
} 