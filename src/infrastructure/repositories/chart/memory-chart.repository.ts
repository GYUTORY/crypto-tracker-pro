import { Injectable } from '@nestjs/common';
import { ChartInterval, IndicatorType, DrawingType } from '../../../shared/dto/chart';
import { OHLCVData, TechnicalIndicator, UserDrawing, ChartSettings } from '../../../domain/entities/chart';
import { OHLCVRepository, TechnicalIndicatorRepository, DrawingRepository, ChartSettingsRepository } from '../../../domain/repositories/chart';

/**
 * 메모리 기반 OHLCV 리포지토리
 */
@Injectable()
export class MemoryOHLCVRepository implements OHLCVRepository {
  private data: Map<string, OHLCVData[]> = new Map();

  async getOHLCVData(
    symbol: string,
    interval: ChartInterval,
    startTime?: number,
    endTime?: number,
    limit?: number
  ): Promise<OHLCVData[]> {
    const key = `${symbol}_${interval}`;
    const data = this.data.get(key) || [];
    
    let filteredData = data;
    
    if (startTime) {
      filteredData = filteredData.filter(item => item.timestamp >= startTime);
    }
    
    if (endTime) {
      filteredData = filteredData.filter(item => item.timestamp <= endTime);
    }
    
    if (limit) {
      filteredData = filteredData.slice(-limit);
    }
    
    return filteredData;
  }

  async saveOHLCVData(data: OHLCVData): Promise<void> {
    const key = `${data.symbol}_${data.interval}`;
    const existingData = this.data.get(key) || [];
    
    // 중복 제거 (같은 타임스탬프가 있으면 업데이트)
    const filteredData = existingData.filter(item => item.timestamp !== data.timestamp);
    filteredData.push(data);
    
    // 타임스탬프 순으로 정렬
    filteredData.sort((a, b) => a.timestamp - b.timestamp);
    
    this.data.set(key, filteredData);
  }

  async saveOHLCVDataBatch(data: OHLCVData[]): Promise<void> {
    for (const item of data) {
      await this.saveOHLCVData(item);
    }
  }

  async deleteOHLCVData(symbol: string, interval: ChartInterval, startTime?: number, endTime?: number): Promise<void> {
    const key = `${symbol}_${interval}`;
    const data = this.data.get(key) || [];
    
    let filteredData = data;
    
    if (startTime) {
      filteredData = filteredData.filter(item => item.timestamp < startTime);
    }
    
    if (endTime) {
      filteredData = filteredData.filter(item => item.timestamp > endTime);
    }
    
    this.data.set(key, filteredData);
  }
}

/**
 * 메모리 기반 기술적 지표 리포지토리
 */
@Injectable()
export class MemoryTechnicalIndicatorRepository implements TechnicalIndicatorRepository {
  private data: Map<string, TechnicalIndicator[]> = new Map();

  async getTechnicalIndicator(
    symbol: string,
    indicator: IndicatorType,
    interval: ChartInterval,
    startTime?: number,
    endTime?: number,
    limit?: number
  ): Promise<TechnicalIndicator[]> {
    const key = `${symbol}_${indicator}_${interval}`;
    const data = this.data.get(key) || [];
    
    let filteredData = data;
    
    if (startTime) {
      filteredData = filteredData.filter(item => item.timestamp >= startTime);
    }
    
    if (endTime) {
      filteredData = filteredData.filter(item => item.timestamp <= endTime);
    }
    
    if (limit) {
      filteredData = filteredData.slice(-limit);
    }
    
    return filteredData;
  }

  async saveTechnicalIndicator(data: TechnicalIndicator): Promise<void> {
    const key = `${data.symbol}_${data.indicator}_${data.interval}`;
    const existingData = this.data.get(key) || [];
    
    // 중복 제거
    const filteredData = existingData.filter(item => item.timestamp !== data.timestamp);
    filteredData.push(data);
    
    // 타임스탬프 순으로 정렬
    filteredData.sort((a, b) => a.timestamp - b.timestamp);
    
    this.data.set(key, filteredData);
  }

  async saveTechnicalIndicatorBatch(data: TechnicalIndicator[]): Promise<void> {
    for (const item of data) {
      await this.saveTechnicalIndicator(item);
    }
  }

  async deleteTechnicalIndicator(
    symbol: string,
    indicator: IndicatorType,
    interval: ChartInterval,
    startTime?: number,
    endTime?: number
  ): Promise<void> {
    const key = `${symbol}_${indicator}_${interval}`;
    const data = this.data.get(key) || [];
    
    let filteredData = data;
    
    if (startTime) {
      filteredData = filteredData.filter(item => item.timestamp < startTime);
    }
    
    if (endTime) {
      filteredData = filteredData.filter(item => item.timestamp > endTime);
    }
    
    this.data.set(key, filteredData);
  }
}

/**
 * 메모리 기반 드로잉 도구 리포지토리
 */
@Injectable()
export class MemoryDrawingRepository implements DrawingRepository {
  private data: Map<string, UserDrawing[]> = new Map();

  async getDrawings(symbol: string): Promise<UserDrawing[]> {
    return this.data.get(symbol) || [];
  }

  async createDrawing(drawing: UserDrawing): Promise<UserDrawing> {
    const drawings = this.data.get(drawing.symbol) || [];
    drawings.push(drawing);
    this.data.set(drawing.symbol, drawings);
    return drawing;
  }

  async updateDrawing(id: string, drawing: Partial<UserDrawing>): Promise<UserDrawing> {
    for (const [symbol, drawings] of this.data.entries()) {
      const index = drawings.findIndex(d => d.id === id);
      if (index !== -1) {
        const updatedDrawing = { ...drawings[index], ...drawing, updatedAt: new Date() };
        drawings[index] = updatedDrawing as UserDrawing;
        this.data.set(symbol, drawings);
        return updatedDrawing as UserDrawing;
      }
    }
    throw new Error(`Drawing with id ${id} not found`);
  }

  async deleteDrawing(id: string): Promise<void> {
    for (const [symbol, drawings] of this.data.entries()) {
      const filteredDrawings = drawings.filter(d => d.id !== id);
      if (filteredDrawings.length !== drawings.length) {
        this.data.set(symbol, filteredDrawings);
        return;
      }
    }
  }

  async deleteDrawingsBySymbol(symbol: string): Promise<void> {
    this.data.delete(symbol);
  }
}

/**
 * 메모리 기반 차트 설정 리포지토리
 */
@Injectable()
export class MemoryChartSettingsRepository implements ChartSettingsRepository {
  private data: Map<string, ChartSettings> = new Map();

  async getChartSettings(symbol: string): Promise<ChartSettings | null> {
    return this.data.get(symbol) || null;
  }

  async saveChartSettings(settings: ChartSettings): Promise<void> {
    this.data.set(settings.symbol, settings);
  }

  async deleteChartSettings(symbol: string): Promise<void> {
    this.data.delete(symbol);
  }
}




