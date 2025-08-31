/**
 * 메모리 기반 가격 저장소 (Memory-based Price Repository)
 * 
 * 암호화폐 가격 데이터를 메모리에 저장하고 관리하는 Repository 구현체입니다.
 * 
 * 주요 기능:
 * - 인메모리 캐싱을 통한 빠른 데이터 접근
 * - 자동 만료 데이터 정리 (TTL 기반)
 * - 주기적 캐시 정리 (메모리 누수 방지)
 * - 애플리케이션 종료 시 리소스 정리
 * 
 * 성능 특성:
 * - 평균 조회 시간: < 1ms
 * - 메모리 사용량: 최대 1000개 심볼 × 약 1KB = 약 1MB
 * - 자동 정리: 30초마다 만료된 데이터 삭제
 * 
 * 사용 시나리오:
 * - 개발 환경에서의 빠른 테스트
 * - 프로덕션 환경에서의 고성능 캐싱
 * - 바이낸스 API 호출 횟수 최소화
 * 
 * Clean Architecture:
 * - Domain Layer의 PriceRepository 인터페이스 구현
 * - Infrastructure Layer에 위치
 * - 비즈니스 로직과 데이터 접근 로직 분리
 */
import { Injectable, Optional, OnModuleDestroy } from '@nestjs/common';
import { Price } from '../../../domain/entities/price';
import { PriceRepository } from '../../../domain/repositories/price';
import Logger from '../../../shared/logger';
import { ConfigService } from '../../../config/config.service';

/**
 * 메모리 기반 가격 저장소 클래스 (Memory-based Price Repository Class)
 * 
 * Map을 사용한 인메모리 캐시 시스템을 구현합니다.
 * 
 * 특징:
 * - Map을 사용한 O(1) 시간 복잡도의 조회/저장
 * - 자동 만료 데이터 정리로 메모리 누수 방지
 * - 설정 가능한 TTL과 정리 간격
 * - 애플리케이션 종료 시 리소스 정리
 */
@Injectable()
export class MemoryPriceRepository implements PriceRepository, OnModuleDestroy {
  // 인메모리 캐시 저장소 (Map 사용으로 O(1) 조회 성능)
  private priceStore: Map<string, Price> = new Map();
  
  // 데이터 유효 기간 (밀리초)
  private readonly ttlMs: number;
  
  // 주기적 정리를 위한 타이머
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * MemoryPriceRepository 생성자
   * 
   * @param configService - 설정 서비스 (캐시 설정 가져오기용)
   * 
   * 초기화 과정:
   * 1. 설정에서 TTL과 정리 간격 가져오기
   * 2. 주기적 만료 데이터 정리 타이머 설정
   * 3. 기본값 설정 (TTL: 30초, 정리 간격: 30초)
   */
  constructor(@Optional() private readonly configService?: ConfigService) {
    // 설정에서 캐시 설정 가져오기 (기본값 제공)
    const cacheConfig = this.configService?.getCacheConfig?.() ?? { ttl: 30_000, cleanupInterval: 30_000 };
    this.ttlMs = cacheConfig.ttl ?? 30_000;
    const interval = cacheConfig.cleanupInterval ?? 30_000;
    
    // 주기적 만료 데이터 정리 타이머 설정
    // 메모리 누수 방지를 위해 자동으로 만료된 데이터 삭제
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