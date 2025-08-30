import { Injectable, Inject } from '@nestjs/common';
import { OHLCVRepository, TechnicalIndicatorRepository } from '../../domain/repositories/chart-repository.interface';
import { TechnicalIndicatorsService } from '../../infrastructure/services/technical-indicators.service';
import { MACDResponseDto } from '../../shared/dto/chart.dto';

export interface GetMACDIndicatorRequest {
  symbol: string;
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  interval: string;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class GetMACDIndicatorUseCase {
  constructor(
    @Inject('OHLCVRepository')
    private readonly ohlcvRepository: OHLCVRepository,
    @Inject('TechnicalIndicatorRepository')
    private readonly technicalIndicatorRepository: TechnicalIndicatorRepository,
    private readonly technicalIndicatorsService: TechnicalIndicatorsService
  ) {}

  async execute(request: GetMACDIndicatorRequest): Promise<MACDResponseDto> {
    const { symbol, fastPeriod, slowPeriod, signalPeriod, interval, startTime, endTime } = request;

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
        indicator: 'MACD',
        parameters: { fast_period: fastPeriod, slow_period: slowPeriod, signal_period: signalPeriod },
        data: []
      };
    }

    // MACD 계산
    const macdData = this.technicalIndicatorsService.calculateMACD(
      ohlcvData,
      fastPeriod,
      slowPeriod,
      signalPeriod
    );

    return {
      symbol,
      indicator: 'MACD',
      parameters: { fast_period: fastPeriod, slow_period: slowPeriod, signal_period: signalPeriod },
      data: macdData.map(item => ({
        timestamp: item.timestamp,
        macd: item.macd,
        signal: item.signal,
        histogram: item.histogram
      }))
    };
  }
}




