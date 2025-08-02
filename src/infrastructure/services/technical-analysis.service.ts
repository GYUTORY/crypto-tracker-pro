import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Logger from '../../shared/logger';

@Injectable()
export class TechnicalAnalysisService {

  async getTechnicalIndicators(symbol: string): Promise<any> {
    try {
      // 바이낸스 API에서 현재 가격만 가져오기
      const tickerResponse = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );

      const ticker = tickerResponse.data;
      const currentPrice = parseFloat(ticker.lastPrice);
      const volumeChange = parseFloat(ticker.priceChangePercent);

      Logger.info(`Price data fetched for ${symbol}: $${currentPrice}`);

      return {
        symbol: symbol,
        price: currentPrice,
        volumeChange: volumeChange,
      };
    } catch (error) {
      Logger.error(`Error fetching price data: ${error.message}`);
      throw new Error('가격 데이터 가져오기 중 오류가 발생했습니다.');
    }
  }
} 