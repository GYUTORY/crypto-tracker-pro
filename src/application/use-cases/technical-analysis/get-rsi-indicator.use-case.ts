import { Injectable, Inject } from '@nestjs/common';
import { OHLCVRepository, TechnicalIndicatorRepository } from '../../domain/repositories/chart-repository.interface';
import { TechnicalIndicatorsService } from '../../infrastructure/services/technical-indicators.service';
import { RSIResponseDto } from '../../shared/dto/chart.dto';

export interface GetRSIIndicatorRequest {
  symbol: string;
  period: number;
  interval: string;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class GetRSIIndicatorUseCase {
  constructor(
    @Inject('OHLCVRepository')
    private readonly ohlcvRepository: OHLCVRepository,
    @Inject('TechnicalIndicatorRepository')
    private readonly technicalIndicatorRepository: TechnicalIndicatorRepository,
    private readonly technicalIndicatorsService: TechnicalIndicatorsService
  ) {}

  async execute(request: GetRSIIndicatorRequest): Promise<RSIResponseDto> {
    const { symbol, period, interval, startTime, endTime } = request;

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
        indicator: 'RSI',
        parameters: { period },
        data: []
      };
    }

    // RSI 계산
    const rsiData = this.technicalIndicatorsService.calculateRSI(ohlcvData, period);

    return {
      symbol,
      indicator: 'RSI',
      parameters: { period },
      data: rsiData.map(item => ({
        timestamp: item.timestamp,
        value: item.value,
        overbought: item.overbought,
        oversold: item.oversold
      }))
    };
  }
}




