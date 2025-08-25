import { Injectable, Inject } from '@nestjs/common';
import { ChartInterval } from '../../shared/dto/chart.dto';
import { OHLCVRepository } from '../../domain/repositories/chart-repository.interface';
import { OHLCVResponseDto } from '../../shared/dto/chart.dto';

export interface GetOHLCVDataRequest {
  symbol: string;
  interval: ChartInterval;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

@Injectable()
export class GetOHLCVDataUseCase {
  constructor(
    @Inject('OHLCVRepository')
    private readonly ohlcvRepository: OHLCVRepository
  ) {}

  async execute(request: GetOHLCVDataRequest): Promise<OHLCVResponseDto> {
    const { symbol, interval, startTime, endTime, limit } = request;

    const data = await this.ohlcvRepository.getOHLCVData(
      symbol,
      interval,
      startTime,
      endTime,
      limit
    );

    return {
      symbol,
      interval,
      data: data.map(item => ({
        timestamp: item.timestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      })),
      pagination: {
        total: data.length,
        page: 1,
        limit: limit || 1000
      }
    };
  }
}




