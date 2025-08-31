/**
 * 추천 컨트롤러 (Recommendation Controller)
 * 
 * AI 기반 암호화폐 추천 API를 제공하는 컨트롤러입니다.
 */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetShortTermRecommendationsUseCase, GetMediumTermRecommendationsUseCase, GetLongTermRecommendationsUseCase, GetAllRecommendationsUseCase } from '@/application/use-cases/recommendation';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';
import { BaseService } from '@/shared/base-response';

@ApiTags('recommendation')
@Controller('recommendation')
export class RecommendationController extends BaseService {
  constructor(
    private readonly shortTermUseCase: GetShortTermRecommendationsUseCase,
    private readonly mediumTermUseCase: GetMediumTermRecommendationsUseCase,
    private readonly longTermUseCase: GetLongTermRecommendationsUseCase,
    private readonly allRecommendationsUseCase: GetAllRecommendationsUseCase,
  ) {
    super();
  }

  @Get('short-term')
  @ApiOperation({
    summary: '단기 추천 조회',
    description: '1-7일 단기 투자를 위한 암호화폐 추천을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '단기 추천 조회 성공',
    type: BaseResponseDto
  })
  async getShortTermRecommendations() {
    return await this.shortTermUseCase.execute();
  }

  @Get('medium-term')
  @ApiOperation({
    summary: '중기 추천 조회',
    description: '1-4주 중기 투자를 위한 암호화폐 추천을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '중기 추천 조회 성공',
    type: BaseResponseDto
  })
  async getMediumTermRecommendations() {
    return await this.mediumTermUseCase.execute();
  }

  @Get('long-term')
  @ApiOperation({
    summary: '장기 추천 조회',
    description: '1-12개월 장기 투자를 위한 암호화폐 추천을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '장기 추천 조회 성공',
    type: BaseResponseDto
  })
  async getLongTermRecommendations() {
    return await this.longTermUseCase.execute();
  }

  @Get('all')
  @ApiOperation({
    summary: '전체 추천 조회',
    description: '단기, 중기, 장기 추천을 모두 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '전체 추천 조회 성공',
    type: BaseResponseDto
  })
  async getAllRecommendations() {
    return await this.allRecommendationsUseCase.execute();
  }
}
