import { Injectable } from '@nestjs/common';
import { NewsRepository } from '../../domain/repositories/news-repository.interface';
import { News, NewsEntity } from '../../domain/entities/news.entity';
import { ConfigService } from '../../config/config.service';
import { TranslationService } from '../services/translation.service';
import * as cheerio from 'cheerio';
import axios from 'axios';
import Logger from '../../shared/logger';

@Injectable()
export class NewsCrawlerRepository implements NewsRepository {
  private readonly cacheTTL = 5 * 60 * 1000; // 5분으로 단축
  private cachedNews: any[] = [];
  private cacheExpiry: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly translationService: TranslationService
  ) {}

  /**
   * 비트코인 관련 뉴스 크롤링
   */
  async crawlBitcoinNews(): Promise<News[]> {
    try {
      Logger.info('비트코인 뉴스 크롤링 시작');
      
      // 모든 크롤링 작업을 병렬로 실행 (타임아웃 설정)
      const [
        koreanNews,
        rssNews,
        coindeskNews,
        cointelegraphNews,
        bitcoinComNews
      ] = await Promise.allSettled([
        this.crawlKoreanNews(),
        this.crawlRssFeeds(),
        this.crawlCoindesk(),
        this.crawlCointelegraph(),
        this.crawlBitcoinCom()
      ].map(promise => 
        Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('크롤링 타임아웃')), 3000)
          )
        ])
      ));

      const news: News[] = [];
      
      // 성공한 결과만 수집
      if (koreanNews.status === 'fulfilled') news.push(...(koreanNews.value as News[]));
      if (rssNews.status === 'fulfilled') news.push(...(rssNews.value as News[]));
      if (coindeskNews.status === 'fulfilled') news.push(...(coindeskNews.value as News[]));
      if (cointelegraphNews.status === 'fulfilled') news.push(...(cointelegraphNews.value as News[]));
      if (bitcoinComNews.status === 'fulfilled') news.push(...(bitcoinComNews.value as News[]));
      
      Logger.info(`수집된 뉴스 개수: ${news.length}개`);
      
      // 중복 제거 및 정렬 (최대 10개로 제한)
      const uniqueNews = this.removeDuplicates(news);
      const sortedNews = uniqueNews.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ).slice(0, 10); // 최대 10개로 제한
      
      // 뉴스가 없으면 더미 데이터 제공
      if (sortedNews.length === 0) {
        Logger.info('수집된 뉴스가 없어 더미 데이터 제공');
        return this.getDummyNews();
      }
      
      // 한국어 번역 (병렬 처리 + 타임아웃)
      Logger.info('뉴스 한국어 번역 시작');
      let translatedNews: News[];
      try {
        translatedNews = await Promise.race([
          this.translationService.translateNewsListParallel(sortedNews),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('번역 타임아웃')), 2000)
          )
        ]);
      } catch (error) {
        Logger.error(`번역 타임아웃: ${error.message}`);
        translatedNews = sortedNews; // 번역 실패 시 원본 반환
      }
      
      Logger.info(`비트코인 뉴스 크롤링 및 번역 완료: ${translatedNews.length}개`);
      return translatedNews;
    } catch (error) {
      Logger.error(`비트코인 뉴스 크롤링 실패: ${error.message}`);
      throw new Error('뉴스 크롤링에 실패했습니다.');
    }
  }

  /**
   * CoinDesk 뉴스 크롤링
   */
  private async crawlCoindesk(): Promise<News[]> {
    try {
      const response = await axios.get('https://www.coindesk.com/tag/bitcoin/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 3000 // 타임아웃 대폭 단축
      });

      const $ = cheerio.load(response.data);
      const news: News[] = [];

      // CoinDesk의 실제 구조에 맞는 선택자 사용
      $('.article-card, .card, article').each((_, element) => {
        const $el = $(element);
        
        // 제목 추출 (여러 선택자 시도)
        let title = $el.find('.card-title, .article-title, h2, h3, .title').first().text().trim();
        if (!title) {
          title = $el.find('a').first().attr('title') || '';
        }
        
        // 설명 추출
        let description = $el.find('.card-description, .article-description, .summary, .excerpt').first().text().trim();
        if (!description) {
          description = $el.find('p').first().text().trim();
        }
        
        // URL 추출
        let url = $el.find('a').first().attr('href');
        if (url && !url.startsWith('http')) {
          url = `https://www.coindesk.com${url}`;
        }
        
        // 이미지 URL 추출
        let imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `https://www.coindesk.com${imageUrl}`;
        }

        if (title && url && title.length > 10 && !title.includes('Advertisement')) {
          news.push(NewsEntity.create(
            title,
            description || '',
            url,
            'CoinDesk',
            new Date(),
            imageUrl
          ));
        }
      });

      Logger.info(`CoinDesk 크롤링 성공: ${news.length}개`);
      return news.slice(0, 10);
    } catch (error) {
      Logger.error(`CoinDesk 크롤링 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * Cointelegraph 뉴스 크롤링
   */
  private async crawlCointelegraph(): Promise<News[]> {
    try {
      const response = await axios.get('https://cointelegraph.com/tags/bitcoin', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 3000 // 타임아웃 대폭 단축
      });

      const $ = cheerio.load(response.data);
      const news: News[] = [];

      // Cointelegraph의 실제 구조에 맞는 선택자 사용
      $('.post-card, .article-card, article, .post').each((_, element) => {
        const $el = $(element);
        
        // 제목 추출
        let title = $el.find('.post-card-inline__title, .post-title, h2, h3, .title').first().text().trim();
        if (!title) {
          title = $el.find('a').first().attr('title') || '';
        }
        
        // 설명 추출
        let description = $el.find('.post-card-inline__text, .post-excerpt, .summary, .excerpt').first().text().trim();
        if (!description) {
          description = $el.find('p').first().text().trim();
        }
        
        // URL 추출
        let url = $el.find('a').first().attr('href');
        if (url && !url.startsWith('http')) {
          url = `https://cointelegraph.com${url}`;
        }
        
        // 이미지 URL 추출
        let imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `https://cointelegraph.com${imageUrl}`;
        }

        if (title && url && title.length > 10 && !title.includes('Advertisement')) {
          news.push(NewsEntity.create(
            title,
            description || '',
            url,
            'Cointelegraph',
            new Date(),
            imageUrl
          ));
        }
      });

      Logger.info(`Cointelegraph 크롤링 성공: ${news.length}개`);
      return news.slice(0, 10);
    } catch (error) {
      Logger.error(`Cointelegraph 크롤링 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * Bitcoin.com 뉴스 크롤링
   */
  private async crawlBitcoinCom(): Promise<News[]> {
    try {
      const response = await axios.get('https://news.bitcoin.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const news: News[] = [];

      // 더 일반적인 선택자 사용
      $('article, .article, .post, .news-item, .post-title').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h1, h2, h3, .title, .headline, .post-title').first().text().trim();
        const description = $el.find('.description, .summary, .excerpt, p').first().text().trim();
        const url = $el.find('a').first().attr('href');
        const imageUrl = $el.find('img').first().attr('src');
        const publishedAt = new Date();

        if (title && url && title.length > 10) {
          news.push(NewsEntity.create(
            title,
            description || '',
            url.startsWith('http') ? url : `https://news.bitcoin.com${url}`,
            'Bitcoin.com',
            publishedAt,
            imageUrl
          ));
        }
      });

      return news.slice(0, 10); // 최대 10개
    } catch (error) {
      Logger.error(`Bitcoin.com 크롤링 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * 중복 뉴스 제거
   */
  private removeDuplicates(news: News[]): News[] {
    const seen = new Set();
    return news.filter(item => {
      const duplicate = seen.has(item.title);
      seen.add(item.title);
      return !duplicate;
    });
  }

  /**
   * 한국어 뉴스 크롤링
   */
  private async crawlKoreanNews(): Promise<News[]> {
    try {
      const news: News[] = [];
      
      // 한국어 암호화폐 뉴스 사이트들
      const koreanNewsSites = [
        {
          url: 'https://www.tokenpost.kr/search?keyword=비트코인',
          name: '토큰포스트',
          selector: '.article-item, .news-item'
        },
        {
          url: 'https://www.coindeskkorea.com/news/',
          name: '코인데스크코리아',
          selector: '.article-card, .news-card'
        }
      ];

      for (const site of koreanNewsSites) {
        try {
                  const response = await axios.get(site.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          },
          timeout: 2000 // 타임아웃 대폭 단축
        });

          const $ = cheerio.load(response.data);
          
          $(site.selector).each((_, element) => {
            const $el = $(element);
            const title = $el.find('h2, h3, .title, .headline').first().text().trim();
            const description = $el.find('.description, .summary, .excerpt, p').first().text().trim();
            const url = $el.find('a').first().attr('href');
            const imageUrl = $el.find('img').first().attr('src');
            
            if (title && url && title.length > 10) {
              const fullUrl = url.startsWith('http') ? url : `${new URL(site.url).origin}${url}`;
              
              news.push(NewsEntity.create(
                title,
                description || '',
                fullUrl,
                site.name,
                new Date(),
                imageUrl
              ));
            }
          });
          
          Logger.info(`${site.name} 한국어 뉴스 크롤링 성공: ${news.length}개`);
        } catch (error) {
          Logger.error(`${site.name} 한국어 뉴스 크롤링 실패: ${error.message}`);
        }
      }

      return news.slice(0, 10);
    } catch (error) {
      Logger.error(`한국어 뉴스 크롤링 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * RSS 피드에서 뉴스 크롤링
   */
  private async crawlRssFeeds(): Promise<News[]> {
    try {
      const news: News[] = [];
      
      // RSS 피드 URL들
      const rssFeeds = [
        'https://cointelegraph.com/rss/tag/bitcoin',
        'https://cryptonews.com/news/bitcoin-news/feed/',
        'https://www.newsbtc.com/feed/',
        'https://bitcoinmagazine.com/.rss/full/'
      ];

      for (const feedUrl of rssFeeds) {
        try {
                  const response = await axios.get(feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          timeout: 2000 // 타임아웃 대폭 단축
        });

          const $ = cheerio.load(response.data, { xmlMode: true });
          
          $('item').each((_, element) => {
            const $el = $(element);
            const title = $el.find('title').text().trim();
            const description = $el.find('description').text().trim();
            const url = $el.find('link').text().trim();
            const pubDate = $el.find('pubDate').text().trim();
            
            if (title && url && title.toLowerCase().includes('bitcoin')) {
              const publishedAt = pubDate ? new Date(pubDate) : new Date();
              
              news.push(NewsEntity.create(
                title,
                description || '',
                url,
                this.getSourceFromUrl(url),
                publishedAt
              ));
            }
          });
          
          Logger.info(`${feedUrl} RSS 크롤링 성공: ${news.length}개`);
        } catch (error) {
          Logger.error(`${feedUrl} RSS 크롤링 실패: ${error.message}`);
        }
      }

      return news.slice(0, 20); // 최대 20개
    } catch (error) {
      Logger.error(`RSS 피드 크롤링 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * URL에서 소스 추출
   */
  private getSourceFromUrl(url: string): string {
    if (url.includes('cointelegraph.com')) return 'Cointelegraph';
    if (url.includes('cryptonews.com')) return 'CryptoNews';
    if (url.includes('newsbtc.com')) return 'NewsBTC';
    if (url.includes('bitcoinmagazine.com')) return 'Bitcoin Magazine';
    return 'Unknown';
  }

  /**
   * 더미 뉴스 데이터 제공
   */
  private getDummyNews(): News[] {
    return [
      NewsEntity.create(
        '비트코인 가격이 50,000달러를 돌파하며 상승세 지속',
        '비트코인 가격이 주요 저항선을 돌파하며 상승세를 보이고 있습니다. 기술적 분석가들은 추가 상승 가능성을 제시하고 있습니다.',
        'https://example.com/news/bitcoin-price-breaks-50000',
        'CoinDesk',
        new Date(Date.now() - 1000 * 60 * 30), // 30분 전
        'https://example.com/images/bitcoin-chart.jpg'
      ),
      NewsEntity.create(
        '이더리움 ETF 승인으로 암호화폐 시장 활성화',
        'SEC의 이더리움 ETF 승인으로 암호화폐 시장이 활성화되고 있습니다. 기관 투자자들의 관심이 높아지고 있습니다.',
        'https://example.com/news/ethereum-etf-approval',
        'Cointelegraph',
        new Date(Date.now() - 1000 * 60 * 60), // 1시간 전
        'https://example.com/images/ethereum-etf.jpg'
      ),
      NewsEntity.create(
        '바이낸스, 새로운 거래 기능 출시',
        '바이낸스가 사용자 경험을 개선하기 위한 새로운 거래 기능을 출시했습니다. 더 빠르고 안전한 거래가 가능해집니다.',
        'https://example.com/news/binance-new-features',
        'Bitcoin.com',
        new Date(Date.now() - 1000 * 60 * 90), // 1시간 30분 전
        'https://example.com/images/binance-platform.jpg'
      ),
      NewsEntity.create(
        '암호화폐 규제 프레임워크 논의 활발',
        '전 세계적으로 암호화폐 규제 프레임워크에 대한 논의가 활발히 진행되고 있습니다. 투명성과 보안이 강화될 것으로 예상됩니다.',
        'https://example.com/news/crypto-regulation-discussion',
        'CoinDesk',
        new Date(Date.now() - 1000 * 60 * 120), // 2시간 전
        'https://example.com/images/regulation.jpg'
      ),
      NewsEntity.create(
        'DeFi 프로토콜 사용량 급증',
        '분산금융(DeFi) 프로토콜의 사용량이 급증하고 있습니다. 사용자들이 중앙화 거래소 대신 DeFi를 선호하는 추세입니다.',
        'https://example.com/news/defi-usage-surge',
        'Cointelegraph',
        new Date(Date.now() - 1000 * 60 * 150), // 2시간 30분 전
        'https://example.com/images/defi-protocol.jpg'
      )
    ];
  }



  /**
   * 캐시된 뉴스 조회
   */
  async getCachedNews(): Promise<News[]> {
    try {
      if (this.cachedNews.length > 0) {
        return this.cachedNews.map((item: any) => ({
          ...item,
          publishedAt: new Date(item.publishedAt)
        }));
      }
      return [];
    } catch (error) {
      Logger.error(`캐시된 뉴스 조회 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * 뉴스 캐시 저장
   */
  async cacheNews(news: News[]): Promise<void> {
    try {
      this.cachedNews = news;
      this.cacheExpiry = Date.now();
      Logger.info('뉴스 캐시 저장 완료');
    } catch (error) {
      Logger.error(`뉴스 캐시 저장 실패: ${error.message}`);
    }
  }

  /**
   * 캐시 만료 확인
   */
  async isCacheExpired(): Promise<boolean> {
    try {
      return Date.now() - this.cacheExpiry > this.cacheTTL;
    } catch (error) {
      return true;
    }
  }

  /**
   * 캐시 삭제
   */
  async clearCache(): Promise<void> {
    try {
      this.cachedNews = [];
      this.cacheExpiry = 0;
      Logger.info('뉴스 캐시 삭제 완료');
    } catch (error) {
      Logger.error(`뉴스 캐시 삭제 실패: ${error.message}`);
    }
  }
}
