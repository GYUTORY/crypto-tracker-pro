import { Injectable, Inject } from '@nestjs/common';
import { NewsRepository } from '@/domain/repositories/news';
import { News, NewsListResponse } from '@/domain/entities/news';
import Logger from '@/shared/logger';

/**
 * 비트코인 뉴스 조회 요청
 */
export interface GetBitcoinNewsRequest {
  forceRefresh?: boolean; // 캐시 무시하고 새로 크롤링
  limit?: number;         // 반환할 최대 개수
  source?: string;        // 특정 소스만 필터링
}

/**
 * 비트코인 뉴스 조회 유스케이스
 */
@Injectable()
export class GetBitcoinNewsUseCase {
  constructor(
    @Inject('NewsRepository')
    private readonly newsRepository: NewsRepository
  ) {}

  /**
   * 비트코인 뉴스 조회 실행
   */
  async execute(request: GetBitcoinNewsRequest = {}): Promise<NewsListResponse> {
    try {
      const { forceRefresh = false, limit, source } = request;
      let news: News[] = [];

      // 캐시 확인
      if (!forceRefresh) {
        const isExpired = await this.newsRepository.isCacheExpired();
        if (!isExpired) {
          news = await this.newsRepository.getCachedNews();
          if (news.length > 0) {
            Logger.info(`캐시된 뉴스 ${news.length}개 조회`);
          }
        }
      }

      // 캐시가 없거나 만료된 경우 새로 크롤링
      if (news.length === 0) {
        Logger.info('뉴스 크롤링 시작');
        news = await this.newsRepository.crawlBitcoinNews();
        
        // 크롤링 성공 시 캐시 저장
        if (news.length > 0) {
          await this.newsRepository.cacheNews(news);
        }
      }

      // 소스 필터링
      if (source) {
        news = news.filter(item => 
          item.source.toLowerCase().includes(source.toLowerCase())
        );
      }

      // 개수 제한
      if (limit && limit > 0) {
        news = news.slice(0, limit);
      }

      // 소스 목록 추출
      const sources = [...new Set(news.map(item => item.source))];

      return {
        news,
        totalCount: news.length,
        lastUpdated: new Date(),
        sources
      };
    } catch (error) {
      throw new Error(`비트코인 뉴스 조회 실패: ${error.message}`);
    }
  }
}
