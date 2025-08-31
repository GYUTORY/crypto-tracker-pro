import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetMarketStatsUseCase } from '@/application/use-cases/market';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';
import { MarketStatsResponseDto } from '@/shared/dto/market';
import { BaseService } from '@/shared/base-response';

/**
 * 시장 통계 컨트롤러
 * 
 * 전체 암호화폐 시장의 통계 정보를 제공합니다.
 */
@ApiTags('market')
@Controller('market')
export class MarketController extends BaseService {
  constructor(
    private readonly getMarketStatsUseCase: GetMarketStatsUseCase
  ) {
    super();
  }

  /**
   * 시장 통계 조회 API
   * 
   * 전체 암호화폐 시장의 통계 정보를 조회합니다.
   * 
   * @returns 시장 통계 정보
   */
  @Get('stats')
  @ApiOperation({
    summary: '시장 통계 조회',
    description: '전체 암호화폐 시장의 통계 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '시장 통계 조회 성공',
    type: BaseResponseDto<MarketStatsResponseDto>
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async getMarketStats(): Promise<BaseResponseDto<MarketStatsResponseDto>> {
    const result = await this.getMarketStatsUseCase.execute();

    return this.success(result, '시장 통계 조회 완료');
  }
}
