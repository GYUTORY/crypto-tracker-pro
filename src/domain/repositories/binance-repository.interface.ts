/**
 * 바이낸스 API 접근 인터페이스
 * 
 * 도메인 레이어에서 바이낸스 API에 접근하기 위한 인터페이스입니다.
 * 스트리밍 관련 기능은 StreamingRepository로 분리됩니다.
 */
import { Price } from '../entities/price.entity';
import { TechnicalData } from '../entities/technical-analysis.entity';

export interface BinanceRepository {
  /**
   * 현재 가격 조회
   * @param symbol - 조회할 암호화폐 심볼 (예: 'BTCUSDT', 'SHIBKRW')
   * @returns 현재 가격 정보
   */
  getCurrentPrice(symbol: string): Promise<Price>;

  /**
   * 심볼별 현재 가격 조회 (문자열 반환)
   * @param symbol - 조회할 암호화폐 심볼
   * @returns 현재 가격 (문자열)
   */
  getSymbolPrice(symbol: string): Promise<string>;

  /**
   * 거래 가능한 심볼 목록 조회
   * @returns 거래 가능한 심볼 목록
   */
  getTradingSymbols(): Promise<string[]>;

  /**
   * 특정 심볼의 기술적 지표 데이터 조회
   * @param symbol - 조회할 암호화폐 심볼
   * @returns 기술적 지표 데이터
   */
  getTechnicalData(symbol: string): Promise<TechnicalData>;
} 