import { News, NewsListResponse } from '../entities/news.entity';

/**
 * 뉴스 리포지토리 인터페이스
 */
export interface NewsRepository {
  /**
   * 비트코인 관련 뉴스 크롤링
   */
  crawlBitcoinNews(): Promise<News[]>;
  
  /**
   * 캐시된 뉴스 조회
   */
  getCachedNews(): Promise<News[]>;
  
  /**
   * 뉴스 캐시 저장
   */
  cacheNews(news: News[]): Promise<void>;
  
  /**
   * 캐시 만료 확인
   */
  isCacheExpired(): Promise<boolean>;
  
  /**
   * 캐시 삭제
   */
  clearCache(): Promise<void>;
}
