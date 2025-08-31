import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BaseService } from '@/shared/base-response';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';
import {
  OHLCVQueryDto,
  OHLCVResponseDto,
  RSIResponseDto,
  MACDResponseDto,
  BollingerBandsResponseDto,
  MovingAverageResponseDto,
  CreateDrawingDto,
  DrawingsResponseDto,
  ChartSettingsDto
} from '@/shared/dto/chart';
import { GetOHLCVDataUseCase } from '@/application/use-cases/price';
import { GetRSIIndicatorUseCase, GetMACDIndicatorUseCase, GetBollingerBandsIndicatorUseCase, GetMovingAverageIndicatorUseCase } from '@/application/use-cases/technical-analysis';
import { CreateDrawingUseCase, GetDrawingsUseCase } from '@/application/use-cases/chart';
import { SampleDataService } from '@/infrastructure/services/utility';
import { Inject } from '@nestjs/common';
import { OHLCVRepository } from '@/domain/repositories/chart';
import { ChartInterval } from '@/shared/dto/chart';

/**
 * 차트 컨트롤러 (Chart Controller)
 * 
 * 고급 암호화폐 차트 기능을 위한 REST API를 제공합니다.
 * 
 * 주요 기능:
 * - OHLCV (Open, High, Low, Close, Volume) 데이터 조회
 * - 기술적 지표 계산 및 조회 (RSI, MACD, Bollinger Bands, Moving Averages)
 * - 사용자 드로잉 도구 데이터 관리 (선, 도형, 텍스트 등)
 * - 차트 설정 저장 및 조회 (테마, 레이아웃, 지표 설정 등)
 * - 샘플 데이터 생성 (개발 및 테스트용)
 * 
 * API 설계 원칙:
 * - RESTful API 설계 패턴 준수
 * - 일관된 응답 형식 (BaseResponseDto 사용)
 * - 상세한 Swagger 문서화
 * - 적절한 HTTP 상태 코드 사용
 * 
 * 사용 예시:
 * ```bash
 * # OHLCV 데이터 조회
 * GET /chart/ohlcv/BTCUSDT?interval=1h&limit=100
 * 
 * # RSI 지표 조회
 * GET /chart/rsi/BTCUSDT?period=14&interval=1h
 * 
 * # 드로잉 생성
 * POST /chart/drawings
 * {
 *   "symbol": "BTCUSDT",
 *   "type": "trend_line",
 *   "coordinates": [[100, 45000], [200, 46000]]
 * }
 * ```
 */
@ApiTags('차트')
@Controller('chart')
export class ChartController extends BaseService {
  constructor(
    private readonly getOHLCVDataUseCase: GetOHLCVDataUseCase,
    private readonly getRSIIndicatorUseCase: GetRSIIndicatorUseCase,
    private readonly getMACDIndicatorUseCase: GetMACDIndicatorUseCase,
    private readonly getBollingerBandsIndicatorUseCase: GetBollingerBandsIndicatorUseCase,
    private readonly getMovingAverageIndicatorUseCase: GetMovingAverageIndicatorUseCase,
    private readonly createDrawingUseCase: CreateDrawingUseCase,
    private readonly getDrawingsUseCase: GetDrawingsUseCase,
    private readonly sampleDataService: SampleDataService,
    @Inject('OHLCVRepository')
    private readonly ohlcvRepository: OHLCVRepository
  ) {
    super();
  }

  /**
   * 샘플 데이터 초기화 (Initialize Sample Data)
   * 
   * 개발 및 테스트를 위한 샘플 OHLCV 데이터를 생성하고 저장합니다.
   * 
   * 동작 과정:
   * 1. 요청된 심볼과 파라미터로 샘플 데이터 생성
   * 2. 생성된 데이터를 메모리 저장소에 저장
   * 3. 저장된 데이터 개수와 함께 성공 응답 반환
   * 
   * 생성되는 데이터:
   * - 랜덤한 OHLCV 값들 (현실적인 가격 변동 패턴)
   * - 지정된 간격과 개수만큼의 데이터 포인트
   * - 시간순으로 정렬된 데이터
   * 
   * @param symbol - 생성할 데이터의 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
   * @param query - 쿼리 파라미터 (interval: 차트 간격, count: 데이터 개수)
   * @returns 생성된 샘플 데이터 정보
   * 
   * 사용 예시:
   * ```bash
   * POST /chart/init-sample-data/BTCUSDT?interval=1h&count=100
   * ```
   */
  @Post('init-sample-data/:symbol')
  @ApiOperation({
    summary: '샘플 데이터 초기화',
    description: '테스트를 위한 샘플 OHLCV 데이터를 생성합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'interval',
    required: false,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    description: '차트 간격 (기본값: 1h)'
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: '생성할 데이터 포인트 수 (기본값: 100)'
  })
  @ApiResponse({
    status: 201,
    description: '샘플 데이터 초기화 성공',
    type: BaseResponseDto
  })
  async initSampleData(
    @Param('symbol') symbol: string,
    @Query() query: any
  ) {
    try {
      const { interval = '1h', count = 100 } = query;

      // 샘플 데이터 생성
      const sampleData = this.sampleDataService.generateSampleOHLCVData(
        symbol.toUpperCase(),
        interval,
        parseInt(count)
      );

      // 데이터 저장
      await this.ohlcvRepository.saveOHLCVDataBatch(sampleData);

      return this.success({
        symbol: symbol.toUpperCase(),
        interval,
        count: sampleData.length,
        message: '샘플 데이터가 성공적으로 생성되었습니다.'
      }, '샘플 데이터 초기화 성공');
    } catch (error) {
      return this.fail(`샘플 데이터 초기화 실패: ${error.message}`);
    }
  }

  /**
   * OHLCV 데이터 조회
   */
  @Get('ohlcv/:symbol')
  @ApiOperation({
    summary: 'OHLCV 데이터 조회',
    description: '지정된 심볼의 OHLCV(Open, High, Low, Close, Volume) 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'interval',
    required: false,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    description: '차트 간격'
  })
  @ApiQuery({
    name: 'start_time',
    required: false,
    type: String,
    description: '시작 시간 (ISO 8601 형식)'
  })
  @ApiQuery({
    name: 'end_time',
    required: false,
    type: String,
    description: '종료 시간 (ISO 8601 형식)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '최대 데이터 포인트 수 (기본값: 1000)'
  })
  @ApiResponse({
    status: 200,
    description: 'OHLCV 데이터 조회 성공',
    type: BaseResponseDto<OHLCVResponseDto>
  })
  async getOHLCVData(
    @Param('symbol') symbol: string,
    @Query() query: OHLCVQueryDto
  ) {
    try {
      const { interval, start_time, end_time, limit } = query;

      // ISO 8601 문자열을 타임스탬프로 변환
      const startTime = start_time ? new Date(start_time).getTime() : undefined;
      const endTime = end_time ? new Date(end_time).getTime() : undefined;

      const result = await this.getOHLCVDataUseCase.execute({
        symbol: symbol.toUpperCase(),
        interval: (interval as ChartInterval) || ChartInterval.ONE_HOUR,
        startTime,
        endTime,
        limit
      });

      return this.success(result, 'OHLCV 데이터 조회 성공');
    } catch (error) {
      return this.fail(`OHLCV 데이터 조회 실패: ${error.message}`);
    }
  }

  /**
   * RSI 지표 조회
   */
  @Get('indicators/rsi/:symbol')
  @ApiOperation({
    summary: 'RSI 지표 조회',
    description: '지정된 심볼의 RSI(상대강도지수) 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'RSI 계산 기간 (기본값: 14)'
  })
  @ApiQuery({
    name: 'interval',
    required: false,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    description: '차트 간격'
  })
  @ApiResponse({
    status: 200,
    description: 'RSI 지표 조회 성공',
    type: BaseResponseDto<RSIResponseDto>
  })
  async getRSI(
    @Param('symbol') symbol: string,
    @Query() query: any
  ) {
    try {
      const { period = 14, interval = '1h', start_time, end_time } = query;

      const startTime = start_time ? new Date(start_time).getTime() : undefined;
      const endTime = end_time ? new Date(end_time).getTime() : undefined;

      const result = await this.getRSIIndicatorUseCase.execute({
        symbol: symbol.toUpperCase(),
        period: parseInt(period),
        interval,
        startTime,
        endTime
      });

      return this.success(result, 'RSI 지표 조회 성공');
    } catch (error) {
      return this.fail(`RSI 지표 조회 실패: ${error.message}`);
    }
  }

  /**
   * MACD 지표 조회
   */
  @Get('indicators/macd/:symbol')
  @ApiOperation({
    summary: 'MACD 지표 조회',
    description: '지정된 심볼의 MACD(이동평균수렴확산) 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'fast_period',
    required: false,
    type: Number,
    description: '빠른 이동평균 기간 (기본값: 12)'
  })
  @ApiQuery({
    name: 'slow_period',
    required: false,
    type: Number,
    description: '느린 이동평균 기간 (기본값: 26)'
  })
  @ApiQuery({
    name: 'signal_period',
    required: false,
    type: Number,
    description: '시그널 라인 기간 (기본값: 9)'
  })
  @ApiResponse({
    status: 200,
    description: 'MACD 지표 조회 성공',
    type: BaseResponseDto<MACDResponseDto>
  })
  async getMACD(
    @Param('symbol') symbol: string,
    @Query() query: any
  ) {
    try {
      const { 
        fast_period = 12, 
        slow_period = 26, 
        signal_period = 9, 
        interval = '1h', 
        start_time, 
        end_time 
      } = query;

      const startTime = start_time ? new Date(start_time).getTime() : undefined;
      const endTime = end_time ? new Date(end_time).getTime() : undefined;

      const result = await this.getMACDIndicatorUseCase.execute({
        symbol: symbol.toUpperCase(),
        fastPeriod: parseInt(fast_period),
        slowPeriod: parseInt(slow_period),
        signalPeriod: parseInt(signal_period),
        interval,
        startTime,
        endTime
      });

      return this.success(result, 'MACD 지표 조회 성공');
    } catch (error) {
      return this.fail(`MACD 지표 조회 실패: ${error.message}`);
    }
  }

  /**
   * 볼린저 밴드 지표 조회
   */
  @Get('indicators/bollinger-bands/:symbol')
  @ApiOperation({
    summary: '볼린저 밴드 지표 조회',
    description: '지정된 심볼의 볼린저 밴드 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: '볼린저 밴드 계산 기간 (기본값: 20)'
  })
  @ApiQuery({
    name: 'std_dev',
    required: false,
    type: Number,
    description: '표준편차 (기본값: 2)'
  })
  @ApiResponse({
    status: 200,
    description: '볼린저 밴드 지표 조회 성공',
    type: BaseResponseDto<BollingerBandsResponseDto>
  })
  async getBollingerBands(
    @Param('symbol') symbol: string,
    @Query() query: any
  ) {
    try {
      const { period = 20, std_dev = 2, interval = '1h', start_time, end_time } = query;

      const startTime = start_time ? new Date(start_time).getTime() : undefined;
      const endTime = end_time ? new Date(end_time).getTime() : undefined;

      const result = await this.getBollingerBandsIndicatorUseCase.execute({
        symbol: symbol.toUpperCase(),
        period: parseInt(period),
        stdDev: parseFloat(std_dev),
        interval,
        startTime,
        endTime
      });

      return this.success(result, '볼린저 밴드 지표 조회 성공');
    } catch (error) {
      return this.fail(`볼린저 밴드 지표 조회 실패: ${error.message}`);
    }
  }

  /**
   * 이동평균 지표 조회
   */
  @Get('indicators/moving-average/:symbol')
  @ApiOperation({
    summary: '이동평균 지표 조회',
    description: '지정된 심볼의 이동평균 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['sma', 'ema', 'wma'],
    description: '이동평균 타입 (기본값: sma)'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: '이동평균 기간 (기본값: 20)'
  })
  @ApiResponse({
    status: 200,
    description: '이동평균 지표 조회 성공',
    type: BaseResponseDto<MovingAverageResponseDto>
  })
  async getMovingAverage(
    @Param('symbol') symbol: string,
    @Query() query: any
  ) {
    try {
      const { type = 'sma', period = 20, interval = '1h', start_time, end_time } = query;

      const startTime = start_time ? new Date(start_time).getTime() : undefined;
      const endTime = end_time ? new Date(end_time).getTime() : undefined;

      const result = await this.getMovingAverageIndicatorUseCase.execute({
        symbol: symbol.toUpperCase(),
        type,
        period: parseInt(period),
        interval,
        startTime,
        endTime
      });

      return this.success(result, '이동평균 지표 조회 성공');
    } catch (error) {
      return this.fail(`이동평균 지표 조회 실패: ${error.message}`);
    }
  }

  /**
   * 드로잉 도구 생성
   */
  @Post('drawings/:symbol')
  @ApiOperation({
    summary: '드로잉 도구 생성',
    description: '지정된 심볼에 드로잉 도구를 생성합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiResponse({
    status: 201,
    description: '드로잉 도구 생성 성공',
    type: BaseResponseDto
  })
  async createDrawing(
    @Param('symbol') symbol: string,
    @Body() createDrawingDto: CreateDrawingDto
  ) {
    try {
      const result = await this.createDrawingUseCase.execute({
        symbol: symbol.toUpperCase(),
        ...createDrawingDto
      });

      return this.success(result, '드로잉 도구 생성 성공');
    } catch (error) {
      return this.fail(`드로잉 도구 생성 실패: ${error.message}`);
    }
  }

  /**
   * 드로잉 도구 조회
   */
  @Get('drawings/:symbol')
  @ApiOperation({
    summary: '드로잉 도구 조회',
    description: '지정된 심볼의 드로잉 도구들을 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCUSDT)',
    example: 'BTCUSDT'
  })
  @ApiResponse({
    status: 200,
    description: '드로잉 도구 조회 성공',
    type: BaseResponseDto<DrawingsResponseDto>
  })
  async getDrawings(@Param('symbol') symbol: string) {
    try {
      const result = await this.getDrawingsUseCase.execute({
        symbol: symbol.toUpperCase()
      });

      return this.success(result, '드로잉 도구 조회 성공');
    } catch (error) {
      return this.fail(`드로잉 도구 조회 실패: ${error.message}`);
    }
  }
}



