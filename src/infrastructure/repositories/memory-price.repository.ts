/**
 * 메모리 기반 가격 저장소
 */
import { Injectable, Optional, OnModuleDestroy } from '@nestjs/common';
import { Price } from '../../domain/entities/price.entity';
import { PriceRepository } from '../../domain/repositories/price-repository.interface';
import Logger from '../../shared/logger';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class MemoryPriceRepository implements PriceRepository, OnModuleDestroy {
  private priceStore: Map<string, Price> = new Map();
  private readonly ttlMs: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const cacheConfig = this.configService?.getCacheConfig?.() ?? { ttl: 30_000, cleanupInterval: 30_000 };
    this.ttlMs = cacheConfig.ttl ?? 30_000;
    const interval = cacheConfig.cleanupInterval ?? 30_000;
    // 주기적 만료 청소
    this.cleanupTimer = setInterval(() => {
      this.deleteExpired(this.ttlMs).catch(() => void 0);
    }, interval);
  }

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

  // 애플리케이션 종료 시 타이머 정리
  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
} 