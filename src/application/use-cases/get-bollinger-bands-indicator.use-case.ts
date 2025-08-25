import { Injectable, Inject } from '@nestjs/common';
import { OHLCVRepository, TechnicalIndicatorRepository } from '../../domain/repositories/chart-repository.interface';
import { TechnicalIndicatorsService } from '../../infrastructure/services/technical-indicators.service';
import { BollingerBandsResponseDto } from '../../shared/dto/chart.dto';

export interface GetBollingerBandsIndicatorRequest {
  symbol: string;
  period: number;
  stdDev: number;
  interval: string;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class GetBollingerBandsIndicatorUseCase {
  constructor(
    @Inject('OHLCVRepository')
    private readonly ohlcvRepository: OHLCVRepository,
    @Inject('TechnicalIndicatorRepository')
    private readonly technicalIndicatorRepository: TechnicalIndicatorRepository,
    private readonly technicalIndicatorsService: TechnicalIndicatorsService
  ) {}

  async execute(request: GetBollingerBandsIndicatorRequest): Promise<BollingerBandsResponseDto> {
    const { symbol, period, stdDev, interval, startTime, endTime } = request;

    // OHLCV 데이터 조회
    const ohlcvData = await this.ohlcvRepository.getOHLCVData(
      symbol,
      interval as any,
      startTime,
      endTime
    );

    if (ohlcvData.length === 0) {
      return {
        symbol,
        indicator: 'Bollinger Bands',
        parameters: { period, std_dev: stdDev },
        data: []
      };
    }

    // 볼린저 밴드 계산
    const bbData = this.technicalIndicatorsService.calculateBollingerBands(
      ohlcvData,
      period,
      stdDev
    );

    return {
      symbol,
      indicator: 'Bollinger Bands',
      parameters: { period, std_dev: stdDev },
      data: bbData.map(item => ({
        timestamp: item.timestamp,
        upper: item.upper,
        middle: item.middle,
        lower: item.lower
      }))
    };
  }
}




