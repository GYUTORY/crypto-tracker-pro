/**
 * 뉴스 도메인 엔티티
 */
export interface News {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
}

/**
 * 뉴스 목록 응답
 */
export interface NewsListResponse {
  news: News[];
  totalCount: number;
  lastUpdated: Date;
  sources: string[];
}

/**
 * 뉴스 엔티티 생성
 */
export class NewsEntity {
  static create(
    title: string,
    description: string,
    url: string,
    source: string,
    publishedAt: Date,
    imageUrl?: string,
    sentiment?: 'positive' | 'negative' | 'neutral',
    keywords?: string[]
  ): News {
    return {
      id: this.generateId(url),
      title,
      description,
      url,
      source,
      publishedAt,
      imageUrl,
      sentiment,
      keywords
    };
  }

  private static generateId(url: string): string {
    // URL을 기반으로 고유 ID 생성
    return Buffer.from(url).toString('base64').substring(0, 16);
  }
}
