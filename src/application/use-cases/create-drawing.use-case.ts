import { Injectable, Inject } from '@nestjs/common';
import { DrawingRepository } from '../../domain/repositories/chart-repository.interface';
import { UserDrawing } from '../../domain/entities/chart.entity';
import { CreateDrawingDto, DrawingType } from '../../shared/dto/chart.dto';

export interface CreateDrawingRequest {
  symbol: string;
  type: DrawingType;
  coordinates: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  style: {
    color: string;
    width: number;
    style: string;
  };
  metadata?: {
    label?: string;
    description?: string;
    userId?: string;
  };
}

@Injectable()
export class CreateDrawingUseCase {
  constructor(
    @Inject('DrawingRepository')
    private readonly drawingRepository: DrawingRepository
  ) {}

  async execute(request: CreateDrawingRequest): Promise<UserDrawing> {
    const { symbol, type, coordinates, style, metadata } = request;

    // 고유 ID 생성
    const id = `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 드로잉 도구 생성
    const drawing = new UserDrawing(
      id,
      symbol,
      type,
      coordinates,
      style,
      metadata
    );

    // 저장
    return await this.drawingRepository.createDrawing(drawing);
  }
}
