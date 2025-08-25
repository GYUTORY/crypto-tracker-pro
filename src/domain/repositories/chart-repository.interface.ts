import { ChartInterval, IndicatorType, DrawingType } from '../../shared/dto/chart.dto';
import { OHLCVData, TechnicalIndicator, UserDrawing, ChartSettings } from '../entities/chart.entity';

/**
 * OHLCV 데이터 리포지토리 인터페이스
 */
export interface OHLCVRepository {
  /**
   * OHLCV 데이터 조회
   */
  getOHLCVData(
    symbol: string,
    interval: ChartInterval,
    startTime?: number,
    endTime?: number,
    limit?: number
  ): Promise<OHLCVData[]>;

  /**
   * OHLCV 데이터 저장
   */
  saveOHLCVData(data: OHLCVData): Promise<void>;

  /**
   * OHLCV 데이터 배치 저장
   */
  saveOHLCVDataBatch(data: OHLCVData[]): Promise<void>;

  /**
   * OHLCV 데이터 삭제
   */
  deleteOHLCVData(symbol: string, interval: ChartInterval, startTime?: number, endTime?: number): Promise<void>;
}

/**
 * 기술적 지표 리포지토리 인터페이스
 */
export interface TechnicalIndicatorRepository {
  /**
   * 기술적 지표 데이터 조회
   */
  getTechnicalIndicator(
    symbol: string,
    indicator: IndicatorType,
    interval: ChartInterval,
    startTime?: number,
    endTime?: number,
    limit?: number
  ): Promise<TechnicalIndicator[]>;

  /**
   * 기술적 지표 데이터 저장
   */
  saveTechnicalIndicator(data: TechnicalIndicator): Promise<void>;

  /**
   * 기술적 지표 데이터 배치 저장
   */
  saveTechnicalIndicatorBatch(data: TechnicalIndicator[]): Promise<void>;

  /**
   * 기술적 지표 데이터 삭제
   */
  deleteTechnicalIndicator(
    symbol: string,
    indicator: IndicatorType,
    interval: ChartInterval,
    startTime?: number,
    endTime?: number
  ): Promise<void>;
}

/**
 * 드로잉 도구 리포지토리 인터페이스
 */
export interface DrawingRepository {
  /**
   * 드로잉 도구 조회
   */
  getDrawings(symbol: string): Promise<UserDrawing[]>;

  /**
   * 드로잉 도구 생성
   */
  createDrawing(drawing: UserDrawing): Promise<UserDrawing>;

  /**
   * 드로잉 도구 수정
   */
  updateDrawing(id: string, drawing: Partial<UserDrawing>): Promise<UserDrawing>;

  /**
   * 드로잉 도구 삭제
   */
  deleteDrawing(id: string): Promise<void>;

  /**
   * 드로잉 도구 배치 삭제
   */
  deleteDrawingsBySymbol(symbol: string): Promise<void>;
}

/**
 * 차트 설정 리포지토리 인터페이스
 */
export interface ChartSettingsRepository {
  /**
   * 차트 설정 조회
   */
  getChartSettings(symbol: string): Promise<ChartSettings | null>;

  /**
   * 차트 설정 저장
   */
  saveChartSettings(settings: ChartSettings): Promise<void>;

  /**
   * 차트 설정 삭제
   */
  deleteChartSettings(symbol: string): Promise<void>;
}




