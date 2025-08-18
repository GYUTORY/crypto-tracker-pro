/**
 * 가격 조회 유스케이스
 * 
 * 암호화폐의 현재 가격을 조회하는 핵심 비즈니스 로직을 담당합니다.
 * 메모리 캐시를 우선적으로 확인하고, 없거나 만료된 경우 외부 API를 호출하여
 * 최신 데이터를 가져오는 2단계 조회 전략을 구현합니다.
 */
import { Injectable, Inject } from '@nestjs/common';
import { Price } from '../../domain/entities/price.entity';
import { PriceRepository } from '../../domain/repositories/price-repository.interface';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { BaseResponse, BaseService } from '../../shared/base-response';
import Logger from '../../shared/logger';

/**
 * 가격 조회 요청 데이터
 */
export interface GetPriceRequest {
  symbol: string;           // 조회할 암호화폐 심볼
  forceRefresh?: boolean;   // 강제 새로고침 여부 (기본값: false)
}

/**
 * 가격 조회 응답 데이터
 */
export interface GetPriceResponse {
  symbol: string;                    // 암호화폐 심볼
  price: string;                     // 현재 가격
  source: 'memory' | 'api';         // 데이터 소스 (메모리 또는 API)
  age?: number;                      // 데이터 나이 (밀리초, 메모리에서 온 경우만)
}

/**
 * 가격 조회 유스케이스
 * 
 * 의존성 주입을 통해 저장소와 외부 API에 접근하며,
 * 캐시 전략과 폴백 메커니즘을 구현합니다.
 */
@Injectable()
export class GetPriceUseCase {
  // 데이터 유효 기간 (30초) - 이 시간이 지나면 데이터를 만료된 것으로 간주
  private readonly DATA_VALIDITY_DURATION = 30 * 1000;
  
  // 경고 임계값 (25초) - 이 시간이 지나면 백그라운드에서 데이터를 갱신
  private readonly WARNING_THRESHOLD = 25 * 1000;

  constructor(
    @Inject('PriceRepository')
    private readonly priceRepository: PriceRepository,
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository
  ) {}

  /**
   * 가격 조회 실행
   * 
   * 1. 강제 새로고침이 아닌 경우 메모리에서 먼저 조회
   * 2. 메모리에 유효한 데이터가 있으면 반환
   * 3. 데이터가 곧 만료될 예정이면 백그라운드에서 갱신
   * 4. 메모리에 없거나 만료된 경우 API에서 조회
   * 5. API에서 가져온 데이터를 메모리에 저장 후 반환
   */
  async execute(request: GetPriceRequest): Promise<GetPriceResponse> {
    try {
      const { symbol, forceRefresh = false } = request;
      const upperSymbol = symbol.toUpperCase(); // 심볼을 대문자로 정규화

      // 강제 새로고침이 아닌 경우 메모리에서 먼저 조회
      if (!forceRefresh) {
        const memoryPrice = await this.priceRepository.findBySymbol(upperSymbol);
        
        // 메모리에 유효한 데이터가 있는 경우
        if (memoryPrice && !memoryPrice.isExpired(this.DATA_VALIDITY_DURATION)) {
          const age = memoryPrice.getAge();
          
          // 데이터가 곧 만료될 예정이면 백그라운드에서 갱신
          // 사용자 응답은 차단하지 않고 비동기적으로 처리
          if (memoryPrice.isGettingOld(this.WARNING_THRESHOLD)) {
            this.refreshPriceInBackground(upperSymbol);
          }

          return {
            symbol: memoryPrice.symbol,
            price: memoryPrice.price,
            source: 'memory' as const,
            age
          };
        }
      }

      // 메모리에 없거나 만료된 경우, 또는 강제 새로고침인 경우 API에서 조회
      Logger.info(`${upperSymbol} 가격을 API에서 조회 중...`);
      const apiPrice = await this.binanceRepository.getCurrentPrice(upperSymbol);
      
      // API에서 가져온 데이터를 메모리에 저장 (다음 요청을 위해)
      await this.priceRepository.save(apiPrice);

      return {
        symbol: apiPrice.symbol,
        price: apiPrice.price,
        source: 'api' as const
      };

    } catch (error) {
      Logger.error(`가격 조회 중 오류: ${error.message}`);
      throw new Error(`${request.symbol} 가격 조회 실패`);
    }
  }

  /**
   * 백그라운드에서 가격 데이터 갱신
   * 
   * 사용자 응답을 차단하지 않고 비동기적으로 최신 데이터를 가져와
   * 메모리를 업데이트합니다. 실패해도 사용자에게는 영향을 주지 않습니다.
   */
  private async refreshPriceInBackground(symbol: string): Promise<void> {
    try {
      const apiPrice = await this.binanceRepository.getCurrentPrice(symbol);
      await this.priceRepository.save(apiPrice);
      Logger.info(`${symbol} 백그라운드 갱신 완료: ${apiPrice.price}`);
    } catch (error) {
      // 백그라운드 갱신 실패는 사용자에게 영향을 주지 않으므로 로그만 남김
      Logger.error(`${symbol} 백그라운드 갱신 실패: ${error.message}`);
    }
  }
} 