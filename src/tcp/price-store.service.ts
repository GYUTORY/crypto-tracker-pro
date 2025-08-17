/**
 * PriceStoreService - 단일 저장소(PriceRepository) 래퍼
 *
 * 기존의 내부 Map을 제거하고, PriceRepository를 단일 진실 공급원(SSOT)으로 사용합니다.
 * 컨트롤러에서 기대하는 메서드 시그니처는 유지하되 내부는 전부 Repository로 위임합니다.
 */
import { Inject, Injectable } from '@nestjs/common';
import { BaseService, BaseResponse } from '../shared/base-response';
import Logger from '../shared/logger';
import { PriceRepository } from '../domain/repositories/price-repository.interface';
import { Price } from '../domain/entities/price.entity';
import { ConfigService } from '../config/config.service';

// 가격 데이터 인터페이스 (기존 컨트롤러 호환 유지)
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
  constructor(
    @Inject('PriceRepository')
    private readonly priceRepository: PriceRepository,
    private readonly configService: ConfigService
  ) {
    super();
  }

  // 저장: PriceData → Price 엔티티로 변환하여 저장
  async setPrice(priceData: PriceData): Promise<void> {
    const price = Price.create(
      priceData.symbol,
      priceData.price,
      priceData.volume,
      priceData.changePercent24h
    );
    await this.priceRepository.save(price);
    Logger.info(`Price updated for ${priceData.symbol}: ${priceData.price}`);
  }

  // 단건 조회 (Repository가 TTL을 자체 적용하도록 전제)
  async getPrice(symbol: string): Promise<PriceData | null> {
    const entity = await this.priceRepository.findBySymbol(symbol.toUpperCase());
    if (!entity) return null;
    return this.toPriceData(entity);
  }

  // 응답 래핑 버전
  async getPriceWithResponse(symbol: string): Promise<BaseResponse<PriceData | null>> {
    const priceData = await this.getPrice(symbol);
    if (priceData) {
      return this.success(priceData, `Price data retrieved for ${symbol}`);
    } else {
      return this.fail(`No price data found for ${symbol}`);
    }
  }

  // 전체 조회
  async getAllPrices(): Promise<PriceData[]> {
    const entities = await this.priceRepository.findAll();
    return entities.map(e => this.toPriceData(e));
  }

  async getAllPricesWithResponse(): Promise<BaseResponse<PriceData[]>> {
    const prices = await this.getAllPrices();
    if (prices.length > 0) {
      return this.success(prices, `Retrieved ${prices.length} price records`);
    } else {
      return this.fail('No price data available');
    }
  }

  // 삭제
  async deletePrice(symbol: string): Promise<boolean> {
    return this.priceRepository.deleteBySymbol(symbol.toUpperCase());
  }

  async deletePriceWithResponse(symbol: string): Promise<BaseResponse<boolean>> {
    const deleted = await this.deletePrice(symbol);
    if (deleted) {
      return this.success(true, `Price data deleted for ${symbol}`);
    } else {
      return this.false(`No price data found to delete for ${symbol}`);
    }
  }

  // 전체 삭제
  async clearAllPrices(): Promise<void> {
    await this.priceRepository.clearAll();
    Logger.info('All price data cleared');
  }

  async clearAllPricesWithResponse(): Promise<BaseResponse<boolean>> {
    await this.clearAllPrices();
    return this.success(true, 'All price data cleared successfully');
  }

  // 카운트
  async getPriceCount(): Promise<number> {
    return this.priceRepository.count();
  }

  async getPriceCountWithResponse(): Promise<BaseResponse<{ count: number }>> {
    const count = await this.getPriceCount();
    return this.success({ count }, 'Price count retrieved successfully');
  }

  // 심볼 목록
  async getSymbols(): Promise<string[]> {
    return this.priceRepository.getSymbols();
  }

  async getSymbolsWithResponse(): Promise<BaseResponse<string[]>> {
    const symbols = await this.getSymbols();
    if (symbols.length > 0) {
      return this.success(symbols, `Retrieved ${symbols.length} symbols`);
    } else {
      return this.fail('No symbols available');
    }
  }

  // 메모리 정보 (TTL은 설정에서 조회)
  getMemoryInfo(): { priceCount: number; symbols: string[]; validityDuration: number } {
    const { ttl } = this.configService.getCacheConfig();
    // 동기 정보 제공을 위해 심볼 수/목록은 즉시값으로 반환
    // 주의: 상세 데이터는 비동기 메서드 사용 권장
    const validityDuration = ttl ?? 30_000;
    return {
      priceCount: 0, // 정확 값은 비동기 count 사용 권장
      symbols: [],   // 정확 값은 비동기 getSymbols 사용 권장
      validityDuration
    };
  }

  async getMemoryInfoWithResponse(): Promise<BaseResponse<{ priceCount: number; symbols: string[]; validityDuration: number }>> {
    const { ttl } = this.configService.getCacheConfig();
    const [count, symbols] = await Promise.all([
      this.priceRepository.count(),
      this.priceRepository.getSymbols()
    ]);
    return this.success(
      { priceCount: count, symbols, validityDuration: ttl ?? 30_000 },
      'Memory information retrieved successfully'
    );
  }

  // 유틸: 엔티티 → PriceData 변환
  private toPriceData(entity: Price): PriceData {
    return {
      symbol: entity.symbol,
      price: entity.price,
      timestamp: entity.timestamp,
      volume: entity.volume,
      changePercent24h: entity.changePercent24h
    };
  }
}