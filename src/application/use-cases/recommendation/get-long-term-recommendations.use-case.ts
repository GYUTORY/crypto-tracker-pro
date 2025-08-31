import { Injectable } from '@nestjs/common';
import { CoinRecommendationService } from '@/infrastructure/services/recommendation';
import { CoinRecommendationResponseDto } from '@/shared/dto/recommendation';

@Injectable()
export class GetLongTermRecommendationsUseCase {
  constructor(
    private readonly coinRecommendationService: CoinRecommendationService
  ) {}

  async execute(): Promise<CoinRecommendationResponseDto> {
    return await this.coinRecommendationService.generateLongTermRecommendations();
  }
}




