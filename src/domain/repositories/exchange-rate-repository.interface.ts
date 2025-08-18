/**
 * 환율 API 접근 인터페이스
 * 
 * 도메인 레이어에서 환율 정보에 접근하기 위한 인터페이스입니다.
 * USD/KRW 환율 정보를 제공합니다.
 */
export interface ExchangeRateRepository {
  /**
   * USD/KRW 환율을 조회합니다.
   * @returns USD 대비 KRW 환율
   */
  getUsdKrwRate(): Promise<number>;
}
