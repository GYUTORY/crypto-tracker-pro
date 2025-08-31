import { Injectable, Inject } from '@nestjs/common';
import { DrawingRepository } from '@/domain/repositories/chart';
import { DrawingsResponseDto } from '@/shared/dto/chart';

export interface GetDrawingsRequest {
  symbol: string;
}

@Injectable()
export class GetDrawingsUseCase {
  constructor(
    @Inject('DrawingRepository')
    private readonly drawingRepository: DrawingRepository
  ) {}

  async execute(request: GetDrawingsRequest): Promise<DrawingsResponseDto> {
    const { symbol } = request;

    const drawings = await this.drawingRepository.getDrawings(symbol);

    return {
      symbol,
      drawings: drawings.map(drawing => ({
        id: drawing.id,
        type: drawing.type,
        coordinates: drawing.coordinates,
        style: drawing.style,
        metadata: drawing.metadata,
        created_at: drawing.createdAt.toISOString(),
        updated_at: drawing.updatedAt.toISOString()
      }))
    };
  }
}




