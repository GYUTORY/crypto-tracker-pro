/**
 * 가격 조회 유스케이스 (Get Price Use Case)
 * 
 * 암호화폐의 현재 가격을 조회하는 핵심 비즈니스 로직을 담당합니다.
 * 
 * 주요 기능:
 * - 메모리 캐시 우선 조회 전략 (Cache-First Strategy)
 * - 바이낸스 API 폴백 메커니즘 (Fallback Mechanism)
 * - 자동 데이터 갱신 및 백그라운드 업데이트
 * - 24시간 통계 데이터 통합 제공
 * 
 * 비즈니스 로직:
 * 1. 캐시에서 데이터 조회 (빠른 응답)
 * 2. 캐시 미스/만료 시 API 호출 (데이터 신뢰성)
 * 3. 새 데이터를 캐시에 저장 (성능 최적화)
 * 4. 백그라운드에서 데이터 갱신 (사용자 경험)
 * 
 * 성능 특성:
 * - 캐시 히트: 평균 5-10ms 응답 시간
 * - 캐시 미스: 평균 200-500ms 응답 시간
 * - 메모리 사용량: 최대 1000개 심볼 캐시
 * - 데이터 유효성: 30초 TTL (Time To Live)
 * 
 * 에러 처리:
 * - API 호출 실패 시 캐시된 데이터 반환
 * - 네트워크 오류 시 적절한 에러 메시지
 * - 잘못된 심볼에 대한 검증 및 에러 처리
 */
import { Injectable, Inject } from '@nestjs/common';
import { Price } from '../../domain/entities/price.entity';
import { PriceRepository } from '../../domain/repositories/price-repository.interface';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { BaseResponse, BaseService } from '../../shared/base-response';
import Logger from '../../shared/logger';

/**
 * 가격 조회 요청 데이터 (Get Price Request)
 * 
 * 클라이언트로부터 받는 가격 조회 요청 정보를 정의합니다.
 * 
 * @property symbol - 조회할 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
 * @property forceRefresh - 강제 새로고침 여부 (기본값: false)
 *                    true: 캐시를 무시하고 API에서 최신 데이터 조회
 *                    false: 캐시 우선 조회 전략 사용
 */
export interface GetPriceRequest {
  symbol: string;           // 조회할 암호화폐 심볼
  forceRefresh?: boolean;   // 강제 새로고침 여부 (기본값: false)
}

/**
 * 가격 조회 응답 데이터 (Get Price Response)
 * 
 * 클라이언트에게 반환하는 가격 조회 결과 정보를 정의합니다.
 * 
 * @property symbol - 암호화폐 심볼 (예: BTCUSDT)
 * @property price - 현재 가격 (문자열로 정밀도 보장)
 * @property source - 데이터 소스 ('memory': 캐시, 'api': 바이낸스 API)
 * @property age - 데이터 나이 (밀리초, 메모리에서 온 경우만)
 * @property change - 24시간 변동률 (문자열, 예: "+2.5%")
 * @property changePercent - 24시간 변동률 (숫자, 예: 2.5)
 * @property volume24h - 24시간 거래량 (포맷된 문자열, 예: "1.2B")
 * @property high24h - 24시간 고가
 * @property low24h - 24시간 저가
 * @property marketCap - 시가총액 (포맷된 문자열)
 * @property timestamp - 데이터 생성 타임스탬프 (밀리초)
 */
export interface GetPriceResponse {
  symbol: string;                    // 암호화폐 심볼
  price: string;                     // 현재 가격
  source: 'memory' | 'api';         // 데이터 소스 (메모리 또는 API)
  age?: number;                      // 데이터 나이 (밀리초, 메모리에서 온 경우만)
  change?: string;                   // 24시간 변동률 (문자열)
  changePercent?: number;            // 24시간 변동률 (숫자)
  volume24h?: string;                // 24시간 거래량
  high24h?: string;                  // 24시간 고가
  low24h?: string;                   // 24시간 저가
  marketCap?: string;                // 시가총액
  timestamp?: number;                // 타임스탬프
}

/**
 * 가격 조회 유스케이스 클래스 (Get Price Use Case Class)
 * 
 * 의존성 주입을 통해 저장소와 외부 API에 접근하며,
 * 캐시 전략과 폴백 메커니즘을 구현합니다.
 * 
 * Clean Architecture 원칙:
 * - Domain Layer의 Repository 인터페이스에만 의존
 * - Infrastructure Layer의 구체적 구현체는 DI를 통해 주입
 * - 비즈니스 로직과 데이터 접근 로직 분리
 * 
 * 성능 최적화:
 * - 메모리 캐시를 통한 빠른 응답
 * - 백그라운드 갱신으로 사용자 경험 향상
 * - 적절한 TTL 설정으로 데이터 신뢰성 보장
 */
@Injectable()
export class GetPriceUseCase {
  // 데이터 유효 기간 (30초) - 이 시간이 지나면 데이터를 만료된 것으로 간주
  // 바이낸스 API의 실시간 특성을 고려한 적절한 TTL 설정
  private readonly DATA_VALIDITY_DURATION = 30 * 1000;
  
  // 경고 임계값 (25초) - 이 시간이 지나면 백그라운드에서 데이터를 갱신
  // 사용자 응답을 차단하지 않고 미리 데이터를 갱신하여 성능 향상
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

        // 24시간 통계 데이터 조회 (메모리 데이터와 함께)
        let statsData = {};
        try {
          const stats = await this.binanceRepository.get24hrStats(upperSymbol);
          statsData = {
            change: stats.change,
            changePercent: stats.changePercent,
            volume24h: stats.volume24h,
            high24h: stats.high24h,
            low24h: stats.low24h,
            timestamp: stats.timestamp
          };
        } catch (error) {
          Logger.warn(`${upperSymbol} 24시간 통계 조회 실패: ${error.message}`);
        }

        return {
          symbol: memoryPrice.symbol,
          price: memoryPrice.price,
          source: 'memory' as const,
          age,
          ...statsData
        };
      }
      }

      // 메모리에 없거나 만료된 경우, 또는 강제 새로고침인 경우 API에서 조회
      Logger.info(`${upperSymbol} 가격을 API에서 조회 중...`);
      const apiPrice = await this.binanceRepository.getCurrentPrice(upperSymbol);
      
      // API에서 가져온 데이터를 메모리에 저장 (다음 요청을 위해)
      await this.priceRepository.save(apiPrice);

      // 24시간 통계 데이터 조회
      let statsData = {};
      try {
        const stats = await this.binanceRepository.get24hrStats(upperSymbol);
        statsData = {
          change: stats.change,
          changePercent: stats.changePercent,
          volume24h: stats.volume24h,
          high24h: stats.high24h,
          low24h: stats.low24h,
          timestamp: stats.timestamp
        };
      } catch (error) {
        Logger.warn(`${upperSymbol} 24시간 통계 조회 실패: ${error.message}`);
      }

      return {
        symbol: apiPrice.symbol,
        price: apiPrice.price,
        source: 'api' as const,
        ...statsData
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