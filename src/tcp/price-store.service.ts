/**
 * PriceStoreService - 메모리 기반 가격 저장소 서비스
 * 
 * 이 서비스는 TCP를 통해 받은 비트코인 가격 정보를 메모리에 저장하고
 * API 요청 시 저장된 데이터를 반환하는 역할을 합니다.
 * 
 * 주요 기능:
 * - 실시간 가격 데이터 메모리 저장
 * - 가격 데이터 조회 및 검색
 * - 데이터 유효성 검증
 * - 메모리 사용량 관리
 * 
 * 데이터 구조:
 * - Map<string, PriceData> 형태로 심볼별 가격 저장
 * - 타임스탬프 기반 데이터 유효성 관리
 * - 최신 데이터 우선 반환
 */
import { Injectable } from '@nestjs/common';
import { BaseService, BaseResponse } from '../services/base.service';

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

  /**
   * 새로운 가격 데이터를 메모리에 저장합니다.
   * 
   * @param priceData 저장할 가격 데이터
   */
  setPrice(priceData: PriceData): void {
    // 타임스탬프가 없는 경우 현재 시간으로 설정
    if (!priceData.timestamp) {
      priceData.timestamp = Date.now();
    }
    
    this.priceStore.set(priceData.symbol.toUpperCase(), priceData);
    
    console.log(`Price updated for ${priceData.symbol}: ${priceData.price}`);
  }

  /**
   * 특정 심볼의 가격 데이터를 조회합니다.
   * 
   * @param symbol 암호화폐 심볼 (예: BTCUSDT)
   * @returns 가격 데이터 또는 null
   */
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

  /**
   * 특정 심볼의 가격 데이터를 조회합니다. (BaseResponse 형태)
   * 
   * @param symbol 암호화폐 심볼 (예: BTCUSDT)
   * @returns BaseResponse 형태의 가격 데이터
   */
  getPriceWithResponse(symbol: string): BaseResponse<PriceData | null> {
    const priceData = this.getPrice(symbol);
    
    if (priceData) {
      return this.success(
        priceData,
        `Price data retrieved for ${symbol}`
      );
    } else {
      return this.createNoDataResponse(`No price data found for ${symbol}`);
    }
  }

  /**
   * 모든 저장된 가격 데이터를 반환합니다.
   * 
   * @returns 모든 가격 데이터 배열
   */
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

  /**
   * 모든 저장된 가격 데이터를 반환합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 모든 가격 데이터
   */
  getAllPricesWithResponse(): BaseResponse<PriceData[]> {
    const prices = this.getAllPrices();
    
    if (prices.length > 0) {
      return this.success(
        prices,
        `Retrieved ${prices.length} price records`
      );
    } else {
      return this.createNoDataResponse('No price data available');
    }
  }

  /**
   * 특정 심볼의 가격 데이터를 삭제합니다.
   * 
   * @param symbol 삭제할 심볼
   * @returns 삭제 성공 여부
   */
  deletePrice(symbol: string): boolean {
    return this.priceStore.delete(symbol.toUpperCase());
  }

  /**
   * 특정 심볼의 가격 데이터를 삭제합니다. (BaseResponse 형태)
   * 
   * @param symbol 삭제할 심볼
   * @returns BaseResponse 형태의 삭제 결과
   */
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

  /**
   * 모든 가격 데이터를 삭제합니다.
   */
  clearAllPrices(): void {
    this.priceStore.clear();
    console.log('All price data cleared');
  }

  /**
   * 모든 가격 데이터를 삭제합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 삭제 결과
   */
  clearAllPricesWithResponse(): BaseResponse<boolean> {
    this.clearAllPrices();
    return this.success(
      true,
      'All price data cleared successfully'
    );
  }

  /**
   * 저장된 가격 데이터의 개수를 반환합니다.
   * 
   * @returns 저장된 가격 데이터 개수
   */
  getPriceCount(): number {
    return this.priceStore.size;
  }

  /**
   * 저장된 가격 데이터의 개수를 반환합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 개수 정보
   */
  getPriceCountWithResponse(): BaseResponse<{ count: number }> {
    return this.success(
      { count: this.getPriceCount() },
      'Price count retrieved successfully'
    );
  }

  /**
   * 저장된 모든 심볼 목록을 반환합니다.
   * 
   * @returns 심볼 배열
   */
  getSymbols(): string[] {
    return Array.from(this.priceStore.keys());
  }

  /**
   * 저장된 모든 심볼 목록을 반환합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 심볼 목록
   */
  getSymbolsWithResponse(): BaseResponse<string[]> {
    const symbols = this.getSymbols();
    
    if (symbols.length > 0) {
      return this.success(
        symbols,
        `Retrieved ${symbols.length} symbols`
      );
    } else {
      return this.createNoDataResponse('No symbols available');
    }
  }

  /**
   * 데이터가 만료되었는지 확인합니다.
   * 
   * @param timestamp 데이터 타임스탬프
   * @returns 만료 여부
   */
  private isDataExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.DATA_VALIDITY_DURATION;
  }

  /**
   * 데이터 유효성 시간을 설정합니다.
   * 
   * @param duration 유효성 시간 (밀리초)
   */
  setDataValidityDuration(duration: number): void {
    this.DATA_VALIDITY_DURATION = duration;
  }

  /**
   * 데이터 유효성 시간을 설정합니다. (BaseResponse 형태)
   * 
   * @param duration 유효성 시간 (밀리초)
   * @returns BaseResponse 형태의 설정 결과
   */
  setDataValidityDurationWithResponse(duration: number): BaseResponse<{ validityDuration: number }> {
    this.setDataValidityDuration(duration);
    return this.success(
      { validityDuration: duration },
      'Data validity duration updated successfully'
    );
  }

  /**
   * 현재 데이터 유효성 시간을 반환합니다.
   * 
   * @returns 유효성 시간 (밀리초)
   */
  getDataValidityDuration(): number {
    return this.DATA_VALIDITY_DURATION;
  }

  /**
   * 현재 데이터 유효성 시간을 반환합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 유효성 시간
   */
  getDataValidityDurationWithResponse(): BaseResponse<{ validityDuration: number }> {
    return this.success(
      { validityDuration: this.DATA_VALIDITY_DURATION },
      'Data validity duration retrieved successfully'
    );
  }

  /**
   * 메모리 사용량 정보를 반환합니다.
   * 
   * @returns 메모리 사용량 정보
   */
  getMemoryInfo(): { priceCount: number; symbols: string[]; validityDuration: number } {
    return {
      priceCount: this.getPriceCount(),
      symbols: this.getSymbols(),
      validityDuration: this.DATA_VALIDITY_DURATION,
    };
  }

  /**
   * 메모리 사용량 정보를 반환합니다. (BaseResponse 형태)
   * 
   * @returns BaseResponse 형태의 메모리 사용량 정보
   */
  getMemoryInfoWithResponse(): BaseResponse<{ priceCount: number; symbols: string[]; validityDuration: number }> {
    return this.success(
      this.getMemoryInfo(),
      'Memory information retrieved successfully'
    );
  }
} 