import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import Logger from '../../shared/logger';

/**
 * 번역 서비스
 * 
 * 외국어 뉴스를 한국어로 번역합니다.
 * Google Translate API 또는 무료 번역 서비스를 사용합니다.
 */
@Injectable()
export class TranslationService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 텍스트를 한국어로 번역
   */
  async translateToKorean(text: string): Promise<string> {
    try {
      if (!text || text.trim().length === 0) {
        return text;
      }

      // 이미 한국어인지 확인
      if (this.isKorean(text)) {
        return text;
      }

      // Google Translate API 사용 (무료 대안)
      const translatedText = await this.translateWithGoogleTranslate(text);
      
      Logger.info(`번역 완료: "${text.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);
      return translatedText;
    } catch (error) {
      Logger.error(`번역 실패: ${error.message}`);
      // 번역 실패 시 원본 텍스트 반환
      return text;
    }
  }

  /**
   * 한국어 여부 확인
   */
  private isKorean(text: string): boolean {
    const koreanRegex = /[가-힣]/;
    return koreanRegex.test(text);
  }

  /**
   * Google Translate API를 사용한 번역
   */
  private async translateWithGoogleTranslate(text: string): Promise<string> {
    try {
      // Google Translate API 대신 무료 번역 서비스 사용 (타임아웃 설정)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5초 타임아웃
      
      const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=' + encodeURIComponent(text), {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`번역 API 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
      
      throw new Error('번역 결과 파싱 실패');
    } catch (error) {
      // Google Translate 실패 시 대체 번역 서비스 사용
      return await this.translateWithAlternativeService(text);
    }
  }

  /**
   * 대체 번역 서비스 사용
   */
  private async translateWithAlternativeService(text: string): Promise<string> {
    try {
      // LibreTranslate API 사용 (무료) - 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1초 타임아웃
      
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: 'ko'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`대체 번역 API 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.translatedText) {
        return data.translatedText;
      }
      
      throw new Error('대체 번역 결과 파싱 실패');
    } catch (error) {
      Logger.error(`대체 번역 실패: ${error.message}`);
      // 모든 번역 실패 시 원본 반환
      return text;
    }
  }

  /**
   * 뉴스 제목과 설명을 한국어로 번역
   */
  async translateNews(news: any): Promise<any> {
    try {
      const translatedTitle = await this.translateToKorean(news.title);
      const translatedDescription = await this.translateToKorean(news.description);
      
      // originalDescription이 있으면 번역, 없으면 description을 번역
      let translatedOriginalDescription = news.originalDescription;
      if (news.originalDescription && news.originalDescription !== news.description) {
        translatedOriginalDescription = await this.translateToKorean(news.originalDescription);
      } else if (news.description) {
        translatedOriginalDescription = await this.translateToKorean(news.description);
      }
      
      return {
        ...news,
        title: translatedTitle,
        description: translatedDescription,
        originalTitle: news.title, // 원본 제목 보존
        originalDescription: translatedOriginalDescription // 번역된 설명
      };
    } catch (error) {
      Logger.error(`뉴스 번역 실패: ${error.message}`);
      return news;
    }
  }

  /**
   * 뉴스 목록을 한국어로 번역 (병렬 처리)
   */
  async translateNewsListParallel(newsList: any[]): Promise<any[]> {
    try {
      // 병렬로 번역 작업 실행 (최대 15개씩 배치 처리)
      const batchSize = 15;
      const translatedNews = [];
      
      for (let i = 0; i < newsList.length; i += batchSize) {
        const batch = newsList.slice(i, i + batchSize);
        const batchPromises = batch.map(async (news) => {
          try {
            return await this.translateNews(news);
          } catch (error) {
            Logger.error(`뉴스 번역 실패: ${error.message}`);
            return news; // 번역 실패 시 원본 반환
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            translatedNews.push(result.value);
          }
        });
      }
      
      return translatedNews;
    } catch (error) {
      Logger.error(`병렬 번역 실패: ${error.message}`);
      return newsList; // 전체 실패 시 원본 반환
    }
  }

  /**
   * 뉴스 목록을 한국어로 번역 (순차 처리 - 기존 메서드)
   */
  async translateNewsList(newsList: any[]): Promise<any[]> {
    const translatedNews = [];
    
    for (const news of newsList) {
      try {
        const translated = await this.translateNews(news);
        translatedNews.push(translated);
      } catch (error) {
        Logger.error(`뉴스 번역 실패: ${error.message}`);
        translatedNews.push(news); // 번역 실패 시 원본 추가
      }
    }
    
    return translatedNews;
  }
}
