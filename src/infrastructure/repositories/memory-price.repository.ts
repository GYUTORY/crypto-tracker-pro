/**
 * 메모리 기반 가격 저장소
 */
import { Injectable } from '@nestjs/common';
import { Price } from '../../domain/entities/price.entity';
import { PriceRepository } from '../../domain/repositories/price-repository.interface';
import Logger from '../../shared/logger';

@Injectable()
export class MemoryPriceRepository implements PriceRepository {
  private priceStore: Map<string, Price> = new Map();

  async save(price: Price): Promise<void> {
    this.priceStore.set(price.symbol.toUpperCase(), price);
    Logger.info(`가격 저장: ${price.symbol} = ${price.price}`);
  }

  async findBySymbol(symbol: string): Promise<Price | null> {
    const price = this.priceStore.get(symbol.toUpperCase());
    return price || null;
  }

  async findAll(): Promise<Price[]> {
    return Array.from(this.priceStore.values());
  }

  async deleteExpired(validityDuration: number): Promise<void> {
    const expiredSymbols: string[] = [];

    for (const [symbol, price] of this.priceStore.entries()) {
      if (price.isExpired(validityDuration)) {
        expiredSymbols.push(symbol);
      }
    }

    expiredSymbols.forEach(symbol => {
      this.priceStore.delete(symbol);
      Logger.debug(`만료된 데이터 삭제: ${symbol}`);
    });
  }

  async deleteBySymbol(symbol: string): Promise<boolean> {
    return this.priceStore.delete(symbol.toUpperCase());
  }

  async clearAll(): Promise<void> {
    this.priceStore.clear();
    Logger.info('모든 가격 데이터 삭제 완료');
  }

  async count(): Promise<number> {
    return this.priceStore.size;
  }

  async getSymbols(): Promise<string[]> {
    return Array.from(this.priceStore.keys());
  }
} 