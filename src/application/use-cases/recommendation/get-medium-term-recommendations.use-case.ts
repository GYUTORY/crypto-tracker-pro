import { Injectable } from '@nestjs/common';
import { CoinRecommendationService } from '../../infrastructure/services/coin-recommendation.service';
import { CoinRecommendationResponseDto } from '../../shared/dto/recommendation.dto';

@Injectable()
export class GetMediumTermRecommendationsUseCase {
  constructor(
    private readonly coinRecommendationService: CoinRecommendationService
  ) {}

  async execute(): Promise<CoinRecommendationResponseDto> {
    return await this.coinRecommendationService.generateMediumTermRecommendations();
  }
}




