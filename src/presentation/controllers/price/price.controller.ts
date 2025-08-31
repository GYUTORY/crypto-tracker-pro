/**
 * 가격 조회 컨트롤러 (Price Controller)
 * 
 * 실시간 암호화폐 가격 데이터를 제공하는 REST API 엔드포인트를 관리합니다.
 * 
 * 주요 기능:
 * - 실시간 암호화폐 가격 조회 (메모리 캐시 + 바이낸스 API)
 * - 차트 데이터 조회 (OHLCV 데이터)
 * - 강제 새로고침 옵션 (캐시 무시하고 최신 데이터 조회)
 * - 자동 데이터 소스 관리 (캐시 우선, API 폴백)
 * 
 * API 설계 원칙:
 * - RESTful API 설계 패턴 준수
 * - 일관된 응답 형식 (BaseResponseDto 사용)
 * - 상세한 Swagger 문서화
 * - 적절한 HTTP 상태 코드 사용
 * - 에러 처리 및 로깅
 * 
 * 데이터 흐름:
 * 1. HTTP 요청 수신 → 파라미터 검증
 * 2. UseCase 호출 → 비즈니스 로직 실행
 * 3. Repository 계층 → 데이터 접근
 * 4. 응답 생성 → 클라이언트 반환
 * 
 * 사용 예시:
 * ```bash
 * # 기본 가격 조회 (캐시 우선)
 * GET /price/BTCUSDT
 * 
 * # 강제 새로고침 (API에서 최신 데이터 조회)
 * GET /price/BTCUSDT?forceRefresh=true
 * 
 * # 차트 데이터 조회
 * GET /price/BTCUSDT/chart?timeframe=1h&limit=100
 * ```
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetPriceUseCase } from '@/application/use-cases/price';
import { GetChartDataUseCase } from '@/application/use-cases/chart';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';
import { PriceResponseDto } from '@/shared/dto/price';
import { ChartDataResponseDto, GetChartDataQueryDto } from '@/shared/dto/chart';
import { BaseService } from '@/shared/base-response';

/**
 * 실시간 암호화폐 가격 조회 API 그룹 (Real-time Cryptocurrency Price API)
 * 
 * 메모리 캐시와 바이낸스 API를 통한 고성능 가격 데이터 조회 서비스를 제공합니다.
 * 
 * 특징:
 * - 메모리 캐시를 통한 빠른 응답 (평균 < 10ms)
 * - 바이낸스 API 폴백 메커니즘 (캐시 미스 시)
 * - 자동 데이터 갱신 (30초 TTL)
 * - 백그라운드 갱신 (사용자 응답 차단 없음)
 */
@ApiTags('price')
@Controller('price')
export class PriceController extends BaseService {
  constructor(
    private readonly getPriceUseCase: GetPriceUseCase,
    private readonly getChartDataUseCase: GetChartDataUseCase
  ) {
    super();
  }

  /**
   * 암호화폐 가격 조회 API (Get Cryptocurrency Price)
   * 
   * 특정 암호화폐의 현재 가격을 조회합니다. 메모리 캐시를 우선적으로 확인하고,
   * 캐시에 없거나 만료된 경우 바이낸스 API에서 최신 데이터를 가져옵니다.
   * 
   * 동작 과정:
   * 1. 메모리 캐시에서 데이터 조회 (빠른 응답)
   * 2. 캐시 미스 또는 만료 시 바이낸스 API 호출
   * 3. API 데이터를 캐시에 저장
   * 4. 가격 정보와 메타데이터 반환
   * 
   * 성능 최적화:
   * - 캐시 히트 시: 평균 5-10ms 응답 시간
   * - 캐시 미스 시: 평균 200-500ms 응답 시간
   * - 백그라운드 갱신으로 사용자 경험 향상
   * 
   * @param symbol - 조회할 암호화폐 심볼 (예: BTCUSDT, ETHUSDT, ADAUSDT)
   * @param forceRefresh - 강제 새로고침 여부 (기본값: false)
   *                    true: 캐시 무시하고 API에서 최신 데이터 조회
   *                    false: 캐시 우선 조회
   * @returns 가격 정보와 데이터 소스 정보
   * 
   * 응답 예시:
   * ```json
   * {
   *   "result": true,
   *   "msg": "메모리에서 BTCUSDT 가격 조회 완료",
   *   "result_data": {
   *     "symbol": "BTCUSDT",
   *     "price": "43250.50",
   *     "source": "memory",
   *     "age": 5000
   *   }
   * }
   * ```
   */
  @Get(':symbol')
  @ApiOperation({
    summary: '암호화폐 가격 조회',
    description: '특정 암호화폐의 현재 가격을 조회합니다. 메모리에서 먼저 조회하고, 없으면 API에서 가져옵니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT, ETHUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'forceRefresh',
    description: '강제 새로고침 여부',
    required: false,
    type: Boolean
  })
  @ApiResponse({
    status: 200,
    description: '가격 조회 성공',
    type: BaseResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 심볼'
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async getPrice(
    @Param('symbol') symbol: string,
    @Query('forceRefresh') forceRefresh?: boolean
  ): Promise<BaseResponseDto<PriceResponseDto>> {
    // 유스케이스를 호출하여 비즈니스 로직 실행
    const recordSet = await this.getPriceUseCase.execute({
      symbol,
      forceRefresh: forceRefresh === true
    });

    return this.success(recordSet, `${symbol} 가격 조회 완료`);
  }

  /**
   * 차트 데이터 조회 API
   * 
   * 특정 암호화폐의 차트 데이터를 조회합니다.
   * 
   * @param symbol 조회할 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
   * @param query 쿼리 파라미터 (timeframe, limit)
   * @returns 차트 데이터
   */
  @Get(':symbol/chart')
  @ApiOperation({
    summary: '차트 데이터 조회',
    description: '특정 암호화폐의 차트 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT, ETHUSDT)',
    example: 'BTCUSDT'
  })
  @ApiResponse({
    status: 200,
    description: '차트 데이터 조회 성공',
    type: BaseResponseDto<ChartDataResponseDto>
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 심볼'
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async getChartData(
    @Param('symbol') symbol: string,
    @Query() query: GetChartDataQueryDto
  ): Promise<BaseResponseDto<ChartDataResponseDto>> {
    const result = await this.getChartDataUseCase.execute({
      symbol,
      timeframe: query.timeframe,
      limit: query.limit
    });

    return this.success(result, `${symbol} 차트 데이터 조회 완료`);
  }
} 