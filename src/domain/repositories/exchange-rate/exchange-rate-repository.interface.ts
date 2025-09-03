/**
 * 환율 리포지토리 인터페이스
 * 
 * 환율 데이터 접근을 위한 추상화된 인터페이스입니다.
 */
export interface ExchangeRateRepository {
  /**
   * 환율 조회
   * @param fromCurrency - 기준 통화
   * @param toCurrency - 대상 통화
   * @returns 환율 정보
   */
  getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number>;
}
