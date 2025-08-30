import { Injectable, Inject } from '@nestjs/common';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import Logger from '../../shared/logger';

/**
 * 차트 데이터 조회 요청
 */
export interface GetChartDataRequest {
  symbol: string;           // 조회할 암호화폐 심볼
  timeframe?: string;       // 시간 단위 (1h, 4h, 1d, 1w)
  limit?: number;          // 데이터 포인트 수
}

/**
 * 차트 데이터 조회 유스케이스
 */
@Injectable()
export class GetChartDataUseCase {
  constructor(
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository
  ) {}

  /**
   * 차트 데이터 조회 실행
   */
  async execute(request: GetChartDataRequest) {
    try {
      const { symbol, timeframe = '1h', limit = 24 } = request;
      const upperSymbol = symbol.toUpperCase();

      Logger.info(`${upperSymbol} 차트 데이터 조회 시작 (${timeframe}, ${limit}개)`);
      
      const chartData = await this.binanceRepository.getChartData(upperSymbol, timeframe, limit);
      
      return chartData;
    } catch (error) {
      throw new Error(`차트 데이터 조회 실패: ${error.message}`);
    }
  }
}
