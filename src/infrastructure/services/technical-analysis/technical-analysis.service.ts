/**
 * 기술적 분석 서비스
 * 
 * 이 클래스는 바이낸스 API를 사용하여 암호화폐의 기술적 지표를 계산합니다.
 * 
 * 주요 기능:
 * - 바이낸스 API에서 24시간 가격 데이터 조회
 * - 현재 가격 및 거래량 변화율 계산
 * - 기술적 지표 기반 데이터 제공
 * 
 * Clean Architecture에서의 역할:
 * - Infrastructure Layer에 위치
 * - 외부 API (바이낸스)와의 실제 통신 담당
 * - 기술적 분석을 위한 데이터 수집
 * 
 * 사용 예시:
 * ```typescript
 * const techService = new TechnicalAnalysisService();
 * const indicators = await techService.getTechnicalIndicators('BTCUSDT');
 * console.log(indicators.price); // 현재 가격
 * console.log(indicators.volumeChange); // 24시간 거래량 변화율
 * ```
 */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Logger from '../../shared/logger';

@Injectable()
export class TechnicalAnalysisService {

  /**
   * 기술적 지표 데이터 조회 메서드
   * 
   * @param symbol - 분석할 암호화폐 심볼 (예: 'BTCUSDT')
   * @returns Promise<any> - 기술적 지표 데이터
   * 
   * 동작 과정:
   * 1. 바이낸스 API 호출 (24시간 티커 데이터)
   * 2. 현재 가격 및 거래량 변화율 추출
   * 3. 결과 반환
   * 4. 에러 처리
   * 
   * 반환 데이터 구조:
   * ```typescript
   * {
   *   symbol: string,        // 암호화폐 심볼
   *   price: number,         // 현재 가격
   *   volumeChange: number   // 24시간 거래량 변화율 (%)
   * }
   * ```
   * 
   * API 엔드포인트:
   * - 바이낸스: https://api.binance.com/api/v3/ticker/24hr
   * - 파라미터: symbol (예: BTCUSDT)
   */
  async getTechnicalIndicators(symbol: string): Promise<any> {
    try {
      // 바이낸스 API에서 24시간 티커 데이터 조회
      // 이 API는 현재 가격, 거래량, 가격 변화율 등을 제공
      const tickerResponse = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );

      // 응답 데이터에서 필요한 정보 추출
      const ticker = tickerResponse.data;
      
      // 현재 가격을 숫자로 변환 (API는 문자열로 반환)
      const currentPrice = parseFloat(ticker.lastPrice);
      
      // 24시간 가격 변화율을 숫자로 변환 (API는 문자열로 반환)
      const volumeChange = parseFloat(ticker.priceChangePercent);

      // 조회 성공 로그
      Logger.info(`Price data fetched for ${symbol}: $${currentPrice}`);

      // 결과 객체 반환
      return {
        symbol: symbol,
        price: currentPrice,
        volumeChange: volumeChange,
      };
    } catch (error) {
      // 에러 발생 시 로그 및 에러 메시지 반환
      Logger.error(`Error fetching price data: ${error.message}`);
      throw new Error('가격 데이터 가져오기 중 오류가 발생했습니다.');
    }
  }
} 