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
