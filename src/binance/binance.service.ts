/**
 * BinanceService - 바이낸스 가격 데이터 서비스
 * 
 * 이 서비스는 TCP를 통해 받은 비트코인 가격 정보를 메모리에서 조회하여
 * API 요청에 응답하는 역할을 합니다.
 * 
 * 주요 기능:
 * - 메모리 기반 가격 데이터 조회
 * - TCP 서버로부터 받은 실시간 데이터 제공
 * - 데이터 유효성 검증
 * - 에러 처리 및 폴백 로직
 * 
 * 데이터 소스:
 * - 1차: TCP 서버를 통해 받은 메모리 데이터
 * - 2차: 바이낸스 API (폴백)
 * 
 * 주의사항:
 * - 메모리 데이터가 없거나 만료된 경우 API 호출
 * - API 호출 제한이 있으므로 적절한 간격을 두고 호출
 * - 심볼은 대문자로 변환하여 사용
 */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PriceStoreService } from '../tcp/price-store.service';
import { BaseService, BaseResponse } from '../services/base.service';

// 바이낸스 API 기본 URL (폴백용)
const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

@Injectable()
export class BinanceService extends BaseService {
  constructor(private readonly priceStoreService: PriceStoreService) {
    super();
  }

  /**
   * 특정 암호화폐의 현재 가격을 조회합니다.
   * 먼저 메모리에서 데이터를 찾고, 없으면 바이낸스 API를 호출합니다.
   * 
   * @param symbol 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
   * @returns 현재 가격 정보
   */
  async getCurrentPrice(symbol: string): Promise<BaseResponse<{ symbol: string; price: string }>> {
    const upperSymbol = symbol.toUpperCase();
    
    // 1차: 메모리에서 가격 데이터 조회
    const memoryPrice = this.priceStoreService.getPrice(upperSymbol);
    if (memoryPrice) {
      console.log(`Price from memory for ${upperSymbol}: ${memoryPrice.price}`);
      return this.createSuccessResponse(
        {
          symbol: memoryPrice.symbol,
          price: memoryPrice.price,
        },
        `Price retrieved from memory for ${upperSymbol}`
      );
    }
    
    // 2차: 바이낸스 API 호출 (폴백)
    console.log(`Price not found in memory for ${upperSymbol}, fetching from API...`);
    try {
      const response = await axios.get(`${BINANCE_API_BASE_URL}/ticker/price`, {
        params: { symbol: upperSymbol },
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
      
      return this.createSuccessResponse(
        priceData,
        `Price retrieved from API for ${upperSymbol}`
      );
    } catch (error) {
      if (error.response?.status === 400) {
        return this.createErrorResponse(
          `Invalid symbol: ${symbol}`,
          'E400'
        );
      }
      return this.createInternalErrorResponse(
        `Failed to fetch price for ${symbol}`,
        null
      );
    }
  }
} 