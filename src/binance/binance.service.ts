/**
 * BinanceService - 바이낸스 가격 데이터 서비스
 * 
 * @Injectable() - NestJS 서비스 데코레이터
 * 의존성 주입(DI)으로 자동 인스턴스 생성 및 관리
 * 메모리 기반 가격 데이터 조회 및 폴백 API 호출
 */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PriceStoreService } from '../tcp/price-store.service';
import { BaseService, BaseResponse } from '../services/base.service';
import { ConfigService } from '../config/config.service';
import Logger from '../Logger';

@Injectable()
export class BinanceService extends BaseService {
  private readonly binanceApiBaseUrl: string;

  constructor(
    private readonly priceStoreService: PriceStoreService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.binanceApiBaseUrl = this.configService.get<string>('binance.baseUrl');
  }

  // 특정 암호화폐의 현재 가격 조회
  async getCurrentPrice(symbol: string): Promise<BaseResponse<{ symbol: string; price: string }>> {
    const upperSymbol = symbol.toUpperCase();
    
    // 1차: 메모리에서 유효한 가격 데이터 조회 (만료된 데이터는 자동으로 null 반환)
    const memoryPrice = this.priceStoreService.getPrice(upperSymbol);
    if (memoryPrice) {
      const dataAge = Date.now() - memoryPrice.timestamp;
      Logger.info(`Price from memory for ${upperSymbol}: ${memoryPrice.price} (age: ${dataAge}ms)`);
      
      // 데이터가 곧 만료될 예정이면 백그라운드에서 갱신 (25초 이상 된 경우)
      if (dataAge > 25 * 1000) {
        Logger.debug(`Data for ${upperSymbol} is getting old, refreshing in background...`);
        this.refreshPriceInBackground(upperSymbol);
      }
      
      return this.success({
          symbol: memoryPrice.symbol,
          price: memoryPrice.price,
        },`Price retrieved from memory for ${upperSymbol}`);
    }
    
    // 2차: 바이낸스 API 호출 (메모리에 없거나 만료된 경우)
    Logger.info(`Price not found or expired in memory for ${upperSymbol}, fetching from API...`);
    return await this.fetchAndStorePrice(upperSymbol);
  }

  // 백그라운드에서 가격 데이터 갱신
  private async refreshPriceInBackground(symbol: string): Promise<void> {
    try {
      const response = await axios.get(`${this.binanceApiBaseUrl}/api/v3/ticker/price`, {
        params: { symbol },
      });
      
      const priceData = {
        symbol: response.data.symbol,
        price: response.data.price,
        timestamp: Date.now(),
      };
      
      this.priceStoreService.setPrice(priceData);
      Logger.info(`Background refresh completed for ${symbol}: ${priceData.price}`);
    } catch (error) {
      Logger.error(`Background refresh failed for ${symbol}: ${error.message}`);
    }
  }

  // API에서 가격을 가져와서 메모리에 저장
  private async fetchAndStorePrice(symbol: string): Promise<BaseResponse<{ symbol: string; price: string }>> {
    try {
      const response = await axios.get(`${this.binanceApiBaseUrl}/api/v3/ticker/price`, {
        params: { symbol },
      });
      
      const priceData = {
        symbol: response.data.symbol,
        price: response.data.price,
      };
      
      // API에서 받은 데이터를 메모리에 저장
      this.priceStoreService.setPrice({
        ...priceData,
        timestamp: Date.now(),
      });
      
      return this.success(priceData, `Price retrieved from API for ${symbol}`);
    } catch (error) {
      if (error.response?.status === 400) {
        return this.false(`Invalid symbol: ${symbol}`,'E400');
      }
      return this.fail(`Failed to fetch price for ${symbol}`,null);
    }
  }
} 