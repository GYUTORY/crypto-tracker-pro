import { Injectable } from '@nestjs/common';
import { RSI, MACD, BollingerBands, SMA, EMA, WMA } from 'technicalindicators';
import { ChartInterval, MovingAverageType } from '../../../shared/dto/chart';
import { OHLCVData, RSIData, MACDData, BollingerBandsData, MovingAverageData } from '../../../domain/entities/chart';

/**
 * 기술적 지표 계산 서비스
 */
@Injectable()
export class TechnicalIndicatorsService {
  /**
   * RSI 계산
   */
  calculateRSI(ohlcvData: OHLCVData[], period: number = 14): RSIData[] {
    if (ohlcvData.length < period) {
      return [];
    }

    const closes = ohlcvData.map(data => data.close);
    const rsiValues = RSI.calculate({ period, values: closes });

    return rsiValues.map((rsi, index) => {
      const timestamp = ohlcvData[index + period - 1].timestamp;
      return new RSIData(timestamp, rsi);
    });
  }

  /**
   * MACD 계산
   */
  calculateMACD(
    ohlcvData: OHLCVData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): MACDData[] {
    if (ohlcvData.length < slowPeriod + signalPeriod) {
      return [];
    }

    const closes = ohlcvData.map(data => data.close);
    const macdValues = MACD.calculate({
      fastPeriod,
      slowPeriod,
      signalPeriod,
      values: closes,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });

    return macdValues.map((macd, index) => {
      const timestamp = ohlcvData[index + slowPeriod + signalPeriod - 1].timestamp;
      return new MACDData(timestamp, macd.MACD, macd.signal, macd.histogram);
    });
  }

  /**
   * 볼린저 밴드 계산
   */
  calculateBollingerBands(
    ohlcvData: OHLCVData[],
    period: number = 20,
    stdDev: number = 2
  ): BollingerBandsData[] {
    if (ohlcvData.length < period) {
      return [];
    }

    const closes = ohlcvData.map(data => data.close);
    const bbValues = BollingerBands.calculate({
      period,
      values: closes,
      stdDev
    });

    return bbValues.map((bb, index) => {
      const timestamp = ohlcvData[index + period - 1].timestamp;
      return new BollingerBandsData(timestamp, bb.upper, bb.middle, bb.lower);
    });
  }

  /**
   * 이동평균 계산
   */
  calculateMovingAverage(
    ohlcvData: OHLCVData[],
    period: number,
    type: MovingAverageType = MovingAverageType.SMA
  ): MovingAverageData[] {
    if (ohlcvData.length < period) {
      return [];
    }

    const closes = ohlcvData.map(data => data.close);
    let maValues: number[];

    switch (type) {
      case MovingAverageType.SMA:
        maValues = SMA.calculate({ period, values: closes });
        break;
      case MovingAverageType.EMA:
        maValues = EMA.calculate({ period, values: closes });
        break;
      case MovingAverageType.WMA:
        maValues = WMA.calculate({ period, values: closes });
        break;
      default:
        maValues = SMA.calculate({ period, values: closes });
    }

    return maValues.map((value, index) => {
      const timestamp = ohlcvData[index + period - 1].timestamp;
      return new MovingAverageData(timestamp, value, type);
    });
  }

  /**
   * 여러 이동평균 동시 계산
   */
  calculateMultipleMovingAverages(
    ohlcvData: OHLCVData[],
    periods: number[],
    type: MovingAverageType = MovingAverageType.SMA
  ): { [period: number]: MovingAverageData[] } {
    const result: { [period: number]: MovingAverageData[] } = {};

    for (const period of periods) {
      result[period] = this.calculateMovingAverage(ohlcvData, period, type);
    }

    return result;
  }

  /**
   * 모든 기술적 지표 계산
   */
  calculateAllIndicators(ohlcvData: OHLCVData[]) {
    return {
      rsi: this.calculateRSI(ohlcvData),
      macd: this.calculateMACD(ohlcvData),
      bollingerBands: this.calculateBollingerBands(ohlcvData),
      sma: this.calculateMultipleMovingAverages(ohlcvData, [20, 50, 200], MovingAverageType.SMA),
      ema: this.calculateMultipleMovingAverages(ohlcvData, [12, 26], MovingAverageType.EMA)
    };
  }
}




