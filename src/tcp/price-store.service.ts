/**
 * PriceStoreService - 메모리 기반 가격 저장소 서비스
 * 
 * @Injectable() - NestJS 서비스 데코레이터
 * Map<string, PriceData> - 메모리 저장소
 * 데이터 유효성 검증 및 관리
 */
import { Injectable } from '@nestjs/common';
import { BaseService, BaseResponse } from '../shared/base-response';
import Logger from '../shared/logger';

// 가격 데이터 인터페이스
export interface PriceData {
  symbol: string;
  price: string;
  timestamp: number;
  volume?: string;
  change24h?: string;
  changePercent24h?: string;
}

@Injectable()
export class PriceStoreService extends BaseService {
  // 메모리에 가격 데이터를 저장하는 Map
  // key: 심볼 (예: BTCUSDT), value: 가격 데이터
  private priceStore: Map<string, PriceData> = new Map();
  
  // 데이터 유효성 시간 (밀리초) - 30초
  private DATA_VALIDITY_DURATION = 30 * 1000;

  constructor() {
    super();
  }

  // 새로운 가격 데이터를 메모리에 저장
  setPrice(priceData: PriceData): void {
    // 타임스탬프가 없는 경우 현재 시간으로 설정
    if (!priceData.timestamp) {
      priceData.timestamp = Date.now();
    }
    
    this.priceStore.set(priceData.symbol.toUpperCase(), priceData);
    
    Logger.info(`Price updated for ${priceData.symbol}: ${priceData.price}`);
  }

  // 특정 심볼의 가격 데이터 조회
  getPrice(symbol: string): PriceData | null {
    const priceData = this.priceStore.get(symbol.toUpperCase());
    
    if (!priceData) {
      return null;
    }

    // 데이터 유효성 검사
    if (this.isDataExpired(priceData.timestamp)) {
      this.priceStore.delete(symbol.toUpperCase());
      return null;
    }

    return priceData;
  }

  // 특정 심볼의 가격 데이터 조회 (BaseResponse 형태)
  getPriceWithResponse(symbol: string): BaseResponse<PriceData | null> {
    const priceData = this.getPrice(symbol);
    
    if (priceData) {
      return this.success(
        priceData,
        `Price data retrieved for ${symbol}`
      );
    } else {
      return this.fail(`No price data found for ${symbol}`);
    }
  }

  // 모든 저장된 가격 데이터 반환
  getAllPrices(): PriceData[] {
    const currentTime = Date.now();
    const validPrices: PriceData[] = [];

    for (const [symbol, priceData] of this.priceStore.entries()) {
      if (!this.isDataExpired(priceData.timestamp)) {
        validPrices.push(priceData);
      } else {
        // 만료된 데이터 삭제
        this.priceStore.delete(symbol);
      }
    }

    return validPrices;
  }

  // 모든 저장된 가격 데이터 반환 (BaseResponse 형태)
  getAllPricesWithResponse(): BaseResponse<PriceData[]> {
    const prices = this.getAllPrices();
    
    if (prices.length > 0) {
      return this.success(
        prices,
        `Retrieved ${prices.length} price records`
      );
    } else {
      return this.fail('No price data available');
    }
  }

  // 특정 심볼의 가격 데이터 삭제
  deletePrice(symbol: string): boolean {
    return this.priceStore.delete(symbol.toUpperCase());
  }

  // 특정 심볼의 가격 데이터 삭제 (BaseResponse 형태)
  deletePriceWithResponse(symbol: string): BaseResponse<boolean> {
    const deleted = this.deletePrice(symbol);
    
    if (deleted) {
      return this.success(
        true,
        `Price data deleted for ${symbol}`
      );
    } else {
      return this.false(
        `No price data found to delete for ${symbol}`
      );
    }
  }

  // 모든 가격 데이터 삭제
  clearAllPrices(): void {
    this.priceStore.clear();
    Logger.info('All price data cleared');
  }

  // 모든 가격 데이터 삭제 (BaseResponse 형태)
  clearAllPricesWithResponse(): BaseResponse<boolean> {
    this.clearAllPrices();
    return this.success(
      true,
      'All price data cleared successfully'
    );
  }

  // 저장된 가격 데이터 개수 반환
  getPriceCount(): number {
    return this.priceStore.size;
  }

  // 저장된 가격 데이터 개수 반환 (BaseResponse 형태)
  getPriceCountWithResponse(): BaseResponse<{ count: number }> {
    return this.success(
      { count: this.getPriceCount() },
      'Price count retrieved successfully'
    );
  }

  // 저장된 모든 심볼 목록 반환
  getSymbols(): string[] {
    return Array.from(this.priceStore.keys());
  }

  // 저장된 모든 심볼 목록 반환 (BaseResponse 형태)
  getSymbolsWithResponse(): BaseResponse<string[]> {
    const symbols = this.getSymbols();
    
    if (symbols.length > 0) {
      return this.success(
        symbols,
        `Retrieved ${symbols.length} symbols`
      );
    } else {
      return this.fail('No symbols available');
    }
  }

  // 데이터 만료 여부 확인
  private isDataExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.DATA_VALIDITY_DURATION;
  }

  // 데이터 유효성 시간 설정
  setDataValidityDuration(duration: number): void {
    this.DATA_VALIDITY_DURATION = duration;
  }

  // 데이터 유효성 시간 설정 (BaseResponse 형태)
  setDataValidityDurationWithResponse(duration: number): BaseResponse<{ validityDuration: number }> {
    this.setDataValidityDuration(duration);
    return this.success(
      { validityDuration: duration },
      'Data validity duration updated successfully'
    );
  }

  // 현재 데이터 유효성 시간 반환
  getDataValidityDuration(): number {
    return this.DATA_VALIDITY_DURATION;
  }

  // 현재 데이터 유효성 시간 반환 (BaseResponse 형태)
  getDataValidityDurationWithResponse(): BaseResponse<{ validityDuration: number }> {
    return this.success(
      { validityDuration: this.DATA_VALIDITY_DURATION },
      'Data validity duration retrieved successfully'
    );
  }

  // 메모리 사용량 정보 반환
  getMemoryInfo(): { priceCount: number; symbols: string[]; validityDuration: number } {
    return {
      priceCount: this.getPriceCount(),
      symbols: this.getSymbols(),
      validityDuration: this.DATA_VALIDITY_DURATION,
    };
  }

  // 메모리 사용량 정보 반환 (BaseResponse 형태)
  getMemoryInfoWithResponse(): BaseResponse<{ priceCount: number; symbols: string[]; validityDuration: number }> {
    return this.success(
      this.getMemoryInfo(),
      'Memory information retrieved successfully'
    );
  }
} 