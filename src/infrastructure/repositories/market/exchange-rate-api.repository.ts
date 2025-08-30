/**
 * 환율 API 구현체
 * 
 * 외부 환율 API를 통해 USD/KRW 환율 정보를 가져옵니다.
 * 여러 API를 폴백으로 사용하여 안정성을 확보합니다.
 */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ExchangeRateRepository } from '../../domain/repositories/exchange-rate-repository.interface';
import Logger from '../../shared/logger';

@Injectable()
export class ExchangeRateApiRepository implements ExchangeRateRepository {
  /**
   * USD/KRW 환율 조회
   * 
   * 여러 환율 API를 순차적으로 시도하여 안정성을 확보합니다.
   * 첫 번째 API가 실패하면 다음 API를 시도합니다.
   */
  async getUsdKrwRate(): Promise<number> {
    const apis = [
      this.tryExchangeRateApi,
      this.tryCurrencyApi,
      this.tryOpenExchangeRatesApi
    ];

    for (const api of apis) {
      try {
        const rate = await api();
        Logger.info(`환율 조회 성공: ${rate} KRW/USD`);
        return rate;
      } catch (error) {
        Logger.warn(`환율 API 실패: ${error.message}`);
        continue;
      }
    }

    throw new Error('모든 환율 API에서 데이터를 가져올 수 없습니다.');
  }

  /**
   * exchangerate-api.com API 시도
   */
  private async tryExchangeRateApi(): Promise<number> {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000
    });

    if (response.data && response.data.rates && response.data.rates.KRW) {
      return response.data.rates.KRW;
    }

    throw new Error('exchangerate-api.com에서 유효한 데이터를 받지 못했습니다.');
  }

  /**
   * currencyapi.com API 시도
   */
  private async tryCurrencyApi(): Promise<number> {
    const response = await axios.get('https://api.currencyapi.com/v3/latest?apikey=free&currencies=KRW&base_currency=USD', {
      timeout: 5000
    });

    if (response.data && response.data.data && response.data.data.KRW) {
      return response.data.data.KRW.value;
    }

    throw new Error('currencyapi.com에서 유효한 데이터를 받지 못했습니다.');
  }

  /**
   * open.er-api.com API 시도
   */
  private async tryOpenExchangeRatesApi(): Promise<number> {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD', {
      timeout: 5000
    });

    if (response.data && response.data.rates && response.data.rates.KRW) {
      return response.data.rates.KRW;
    }

    throw new Error('open.er-api.com에서 유효한 데이터를 받지 못했습니다.');
  }
}
