import { Injectable, Inject } from '@nestjs/common';
import { OHLCVRepository, TechnicalIndicatorRepository } from '@/domain/repositories/chart';
import { TechnicalIndicatorsService } from '@/infrastructure/services/technical-analysis';
import { MovingAverageResponseDto, MovingAverageType } from '@/shared/dto/chart';

export interface GetMovingAverageIndicatorRequest {
  symbol: string;
  type: string;
  period: number;
  interval: string;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class GetMovingAverageIndicatorUseCase {
  constructor(
    @Inject('OHLCVRepository')
    private readonly ohlcvRepository: OHLCVRepository,
    @Inject('TechnicalIndicatorRepository')
    private readonly technicalIndicatorRepository: TechnicalIndicatorRepository,
    private readonly technicalIndicatorsService: TechnicalIndicatorsService
  ) {}

  async execute(request: GetMovingAverageIndicatorRequest): Promise<MovingAverageResponseDto> {
    const { symbol, type, period, interval, startTime, endTime } = request;

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
        indicator: 'Moving Average',
        parameters: { period, type: type as MovingAverageType },
        data: []
      };
    }

    // 이동평균 계산
    const maData = this.technicalIndicatorsService.calculateMovingAverage(
      ohlcvData,
      period,
      type as MovingAverageType
    );

    return {
      symbol,
      indicator: 'Moving Average',
      parameters: { period, type: type as MovingAverageType },
      data: maData.map(item => ({
        timestamp: item.timestamp,
        value: item.value
      }))
    };
  }
}




