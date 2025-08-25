import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetBitcoinNewsUseCase } from '../../application/use-cases/get-bitcoin-news.use-case';
import { BaseService } from '../../shared/base-response';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { GetBitcoinNewsQueryDto, BitcoinNewsResponseDto } from '../../shared/dto/news.dto';

/**
 * 뉴스 컨트롤러
 * 
 * 비트코인 관련 뉴스를 크롤링하고 제공합니다.
 */
@ApiTags('뉴스')
@Controller('news')
export class NewsController extends BaseService {
  constructor(
    private readonly getBitcoinNewsUseCase: GetBitcoinNewsUseCase
  ) {
    super();
  }

  /**
   * 전체 뉴스 조회 (페이지네이션 지원)
   */
  @Get()
  @ApiOperation({
    summary: '전체 뉴스 조회',
    description: '전체 암호화폐 관련 뉴스를 페이지네이션과 함께 조회합니다.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 뉴스 개수 (기본값: 10, 최대: 50)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)'
  })
  @ApiQuery({
    name: 'source',
    required: false,
    type: String,
    description: '특정 소스만 필터링 (예: CoinDesk, Cointelegraph)'
  })
  @ApiResponse({
    status: 200,
    description: '뉴스 조회 성공',
    type: BaseResponseDto<BitcoinNewsResponseDto>
  })
  async getAllNews(@Query() query: any) {
    try {
      const { limit = 10, page = 1, source } = query;
      
      const result = await this.getBitcoinNewsUseCase.execute({
        limit: parseInt(limit),
        source
      });

      // 페이지네이션 처리
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = result.news.slice(startIndex, endIndex);
      
      const paginatedResult = {
        news: paginatedNews,
        totalCount: result.totalCount,
        lastUpdated: result.lastUpdated,
        sources: result.sources,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.totalCount / limit),
          totalItems: result.totalCount,
          itemsPerPage: parseInt(limit)
        }
      };

      return this.success(paginatedResult, '전체 뉴스 조회 성공');
    } catch (error) {
      return this.fail(`뉴스 조회 실패: ${error.message}`);
    }
  }

  /**
   * 비트코인 뉴스 조회
   */
  @Get('bitcoin')
  @ApiOperation({
    summary: '비트코인 뉴스 조회',
    description: '다양한 소스에서 비트코인 관련 뉴스를 크롤링하여 제공합니다. 30분간 캐시됩니다.'
  })
  @ApiQuery({
    name: 'forceRefresh',
    required: false,
    type: Boolean,
    description: '캐시 무시하고 새로 크롤링 (기본값: false)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '반환할 최대 개수 (기본값: 전체)'
  })
  @ApiQuery({
    name: 'source',
    required: false,
    type: String,
    description: '특정 소스만 필터링 (예: CoinDesk, Cointelegraph)'
  })
  @ApiResponse({
    status: 200,
    description: '뉴스 조회 성공',
    type: BaseResponseDto<BitcoinNewsResponseDto>
  })
  async getBitcoinNews(@Query() query: GetBitcoinNewsQueryDto) {
    try {
      const result = await this.getBitcoinNewsUseCase.execute({
        forceRefresh: query.forceRefresh,
        limit: query.limit,
        source: query.source
      });

      return this.success(result, '비트코인 뉴스 조회 성공');
    } catch (error) {
      return this.fail(`뉴스 조회 실패: ${error.message}`);
    }
  }

  /**
   * 뉴스 검색
   */
  @Get('search')
  @ApiOperation({
    summary: '뉴스 검색',
    description: '키워드로 뉴스를 검색합니다.'
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: '검색 키워드'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '반환할 최대 개수 (기본값: 10, 최대: 50)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)'
  })
  @ApiResponse({
    status: 200,
    description: '뉴스 검색 성공',
    type: BaseResponseDto<BitcoinNewsResponseDto>
  })
  async searchNews(@Query() query: any) {
    try {
      const { q, limit = 10, page = 1 } = query;
      
      if (!q) {
        return this.fail('검색 키워드가 필요합니다.');
      }

      const result = await this.getBitcoinNewsUseCase.execute({
        limit: parseInt(limit)
      });

      // 키워드로 필터링
      const filteredNews = result.news.filter(news => 
        news.title.toLowerCase().includes(q.toLowerCase()) ||
        news.description.toLowerCase().includes(q.toLowerCase())
      );

      // 페이지네이션 처리
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = filteredNews.slice(startIndex, endIndex);
      
      const searchResult = {
        news: paginatedNews,
        totalCount: filteredNews.length,
        lastUpdated: result.lastUpdated,
        sources: result.sources,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredNews.length / limit),
          totalItems: filteredNews.length,
          itemsPerPage: parseInt(limit)
        }
      };

      return this.success(searchResult, '뉴스 검색 성공');
    } catch (error) {
      return this.fail(`뉴스 검색 실패: ${error.message}`);
    }
  }

  /**
   * 뉴스 캐시 새로고침
   */
  @Post('refresh')
  @ApiOperation({
    summary: '뉴스 캐시 새로고침',
    description: '캐시를 무시하고 새로운 뉴스를 크롤링합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '캐시 새로고침 성공',
    type: BaseResponseDto<BitcoinNewsResponseDto>
  })
  async refreshNews() {
    try {
      const result = await this.getBitcoinNewsUseCase.execute({
        forceRefresh: true
      });

      return this.success(result, '뉴스 캐시 새로고침 성공');
    } catch (error) {
      return this.fail(`뉴스 새로고침 실패: ${error.message}`);
    }
  }
}
