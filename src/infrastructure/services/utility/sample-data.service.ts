import { Injectable } from '@nestjs/common';
import { ChartInterval } from '../../shared/dto/chart.dto';
import { OHLCVData } from '../../domain/entities/chart.entity';

/**
 * 샘플 데이터 생성 서비스
 */
@Injectable()
export class SampleDataService {
  /**
   * 샘플 OHLCV 데이터 생성
   */
  generateSampleOHLCVData(symbol: string, interval: string, count: number): OHLCVData[] {
    const data: OHLCVData[] = [];
    const now = Date.now();
    
    // 간격에 따른 밀리초 계산
    const intervalMs = this.getIntervalMs(interval);
    
    // 기본 가격 (비트코인 기준)
    let basePrice = 45000 + Math.random() * 10000;
    
    for (let i = 0; i < count; i++) {
      const timestamp = now - (count - i - 1) * intervalMs;
      
      // 가격 변동 시뮬레이션
      const changePercent = (Math.random() - 0.5) * 0.1; // ±5% 변동
      const change = basePrice * changePercent;
      basePrice += change;
      
      // OHLCV 데이터 생성
      const open = basePrice;
      const high = open + Math.random() * 1000;
      const low = open - Math.random() * 1000;
      const close = low + Math.random() * (high - low);
      const volume = Math.random() * 1000 + 100;
      
      data.push(new OHLCVData(
        symbol,
        interval as ChartInterval,
        timestamp,
        open,
        high,
        low,
        close,
        volume
      ));
    }
    
    return data;
  }

  /**
   * 간격을 밀리초로 변환
   */
  private getIntervalMs(interval: string): number {
    switch (interval) {
      case '1m':
        return 60 * 1000;
      case '5m':
        return 5 * 60 * 1000;
      case '15m':
        return 15 * 60 * 1000;
      case '30m':
        return 30 * 60 * 1000;
      case '1h':
        return 60 * 60 * 1000;
      case '4h':
        return 4 * 60 * 60 * 1000;
      case '1d':
        return 24 * 60 * 60 * 1000;
      case '1w':
        return 7 * 24 * 60 * 60 * 1000;
      case '1M':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000; // 기본값: 1시간
    }
  }

  /**
   * 여러 심볼에 대한 샘플 데이터 생성
   */
  generateMultipleSymbolsData(symbols: string[], interval: string, count: number): { [symbol: string]: OHLCVData[] } {
    const result: { [symbol: string]: OHLCVData[] } = {};
    
    for (const symbol of symbols) {
      result[symbol] = this.generateSampleOHLCVData(symbol, interval, count);
    }
    
    return result;
  }

  /**
   * 특정 기간의 샘플 데이터 생성
   */
  generateSampleDataForPeriod(
    symbol: string,
    interval: string,
    startTime: number,
    endTime: number
  ): OHLCVData[] {
    const intervalMs = this.getIntervalMs(interval);
    const count = Math.floor((endTime - startTime) / intervalMs);
    
    return this.generateSampleOHLCVData(symbol, interval, count);
  }
}




