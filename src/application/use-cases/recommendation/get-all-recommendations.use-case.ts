/**
 * 전체 추천 조회 유스케이스 (Get All Recommendations Use Case)
 * 
 * 단기, 중기, 장기 추천을 모두 조회하는 Use Case입니다.
 */
import { Injectable } from '@nestjs/common';
import { GetShortTermRecommendationsUseCase } from './get-short-term-recommendations.use-case';
import { GetMediumTermRecommendationsUseCase } from './get-medium-term-recommendations.use-case';
import { GetLongTermRecommendationsUseCase } from './get-long-term-recommendations.use-case';
import { BaseResponse, BaseService } from '../../shared/base-response';
import { AllRecommendationsResponseDto } from '../../shared/dto/recommendation.dto';

@Injectable()
export class GetAllRecommendationsUseCase extends BaseService {
  constructor(
    private readonly shortTermUseCase: GetShortTermRecommendationsUseCase,
    private readonly mediumTermUseCase: GetMediumTermRecommendationsUseCase,
    private readonly longTermUseCase: GetLongTermRecommendationsUseCase,
  ) {
    super();
  }

  async execute(): Promise<BaseResponse<AllRecommendationsResponseDto>> {
    try {
      // 각 추천 Use Case를 병렬로 실행
      const [shortTerm, mediumTerm, longTerm] = await Promise.all([
        this.shortTermUseCase.execute(),
        this.mediumTermUseCase.execute(),
        this.longTermUseCase.execute(),
      ]);

      const response: AllRecommendationsResponseDto = {
        shortTerm,
        mediumTerm,
        longTerm,
        overallMarketStatus: '전체 시장이 안정적인 상태입니다.',
        generatedAt: new Date().toISOString(),
      };

      return this.success(response, '전체 추천 조회 완료');
    } catch (error) {
      return this.false(`전체 추천 조회 실패: ${error.message}`);
    }
  }
}
