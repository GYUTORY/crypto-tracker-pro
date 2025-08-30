import { Injectable, Inject } from '@nestjs/common';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import Logger from '../../shared/logger';

/**
 * 시장 통계 조회 유스케이스
 */
@Injectable()
export class GetMarketStatsUseCase {
  constructor(
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository
  ) {}

  /**
   * 시장 통계 조회 실행
   */
  async execute() {
    try {
      Logger.info('시장 통계 조회 시작');
      
      // 임시로 하드코딩된 데이터 반환 (실제로는 CoinGecko API 등을 사용)
      const marketStats = {
        totalMarketCap: '2.1T',
        totalVolume24h: '50B',
        btcDominance: '48.5%',
        activeCoins: 2000,
        marketChange24h: '+1.2%',
        fearGreedIndex: 65,
        timestamp: Date.now()
      };
      
      Logger.info('시장 통계 조회 완료');
      return marketStats;
    } catch (error) {
      throw new Error(`시장 통계 조회 실패: ${error.message}`);
    }
  }
}
