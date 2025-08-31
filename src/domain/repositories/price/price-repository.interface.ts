/**
 * 가격 데이터 저장소 인터페이스
 */
import { Price } from '../../entities/price';

export interface PriceRepository {
  save(price: Price): Promise<void>;
  findBySymbol(symbol: string): Promise<Price | null>;
  findAll(): Promise<Price[]>;
  deleteExpired(validityDuration: number): Promise<void>;
  deleteBySymbol(symbol: string): Promise<boolean>;
  clearAll(): Promise<void>;
  count(): Promise<number>;
  getSymbols(): Promise<string[]>;
} 