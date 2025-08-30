import { ChartInterval, IndicatorType, DrawingType, MovingAverageType } from '../../shared/dto/chart.dto';

/**
 * OHLCV 데이터 엔티티
 */
export class OHLCVData {
  constructor(
    public readonly symbol: string,
    public readonly interval: ChartInterval,
    public readonly timestamp: number,
    public readonly open: number,
    public readonly high: number,
    public readonly low: number,
    public readonly close: number,
    public readonly volume: number
  ) {}
}

/**
 * 기술적 지표 엔티티
 */
export class TechnicalIndicator {
  constructor(
    public readonly symbol: string,
    public readonly indicator: IndicatorType,
    public readonly interval: ChartInterval,
    public readonly timestamp: number,
    public readonly data: any
  ) {}
}

/**
 * RSI 데이터 엔티티
 */
export class RSIData {
  constructor(
    public readonly timestamp: number,
    public readonly value: number,
    public readonly overbought: number = 70,
    public readonly oversold: number = 30
  ) {}
}

/**
 * MACD 데이터 엔티티
 */
export class MACDData {
  constructor(
    public readonly timestamp: number,
    public readonly macd: number,
    public readonly signal: number,
    public readonly histogram: number
  ) {}
}

/**
 * 볼린저 밴드 데이터 엔티티
 */
export class BollingerBandsData {
  constructor(
    public readonly timestamp: number,
    public readonly upper: number,
    public readonly middle: number,
    public readonly lower: number
  ) {}
}

/**
 * 이동평균 데이터 엔티티
 */
export class MovingAverageData {
  constructor(
    public readonly timestamp: number,
    public readonly value: number,
    public readonly type: MovingAverageType
  ) {}
}

/**
 * 사용자 드로잉 도구 엔티티
 */
export class UserDrawing {
  constructor(
    public readonly id: string,
    public readonly symbol: string,
    public readonly type: DrawingType,
    public readonly coordinates: {
      start: { x: number; y: number };
      end: { x: number; y: number };
    },
    public readonly style: {
      color: string;
      width: number;
      style: string;
    },
    public readonly metadata?: {
      label?: string;
      description?: string;
      userId?: string;
    },
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}

/**
 * 차트 설정 엔티티
 */
export class ChartSettings {
  constructor(
    public readonly symbol: string,
    public readonly interval: ChartInterval,
    public readonly indicators: Array<{
      name: string;
      enabled: boolean;
      parameters: Record<string, any>;
    }>,
    public readonly drawings: {
      enabled: boolean;
      autoSave: boolean;
    },
    public readonly theme: string,
    public readonly layout: {
      chartType: string;
      timezone: string;
    }
  ) {}
}




