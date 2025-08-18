/**
 * 가격 예측 컨트롤러
 * 
 * HTTP 요청을 받아서 가격 예측 유스케이스를 호출하는 프레젠테이션 레이어입니다.
 * Swagger 데코레이터를 사용하여 API 문서를 자동으로 생성하고,
 * 클라이언트가 쉽게 API를 이해하고 사용할 수 있도록 도와줍니다.
 */
import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PredictPriceUseCase } from '../../application/use-cases/predict-price.use-case';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { BaseService } from '../../shared/base-response';

/**
 * 가격 예측 모델 API 그룹
 * AI 기반 암호화폐 가격 예측 및 분석
 */
@ApiTags('prediction')
@Controller('prediction')
export class PredictionController extends BaseService {
  constructor(
    private readonly predictPriceUseCase: PredictPriceUseCase
  ) {
    super();
  }

  /**
   * 암호화폐 가격 예측 API (GET 방식)
   * 
   * 특정 암호화폐의 미래 가격을 예측합니다. 다양한 시간대(1시간, 4시간, 24시간, 1주, 1개월, 3개월)의
   * 예측과 함께 지지/저항선, 신뢰도를 제공합니다.
   * 
   * @param symbol 예측할 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
   * @param timeframes 예측할 시간대들 (선택적, 기본값: 모든 시간대)
   * @param forceRefresh 강제 새로고침 여부 (기본값: false)
   * @returns 가격 예측 정보와 분석 결과
   */
  @Get(':symbol')
  @ApiOperation({
    summary: '암호화폐 가격 예측 (GET)',
    description: '특정 암호화폐의 미래 가격을 예측합니다. 다양한 시간대의 예측과 지지/저항선을 제공합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCKRW, ETHKRW)',
    example: 'BTCKRW'
  })
  @ApiQuery({
    name: 'timeframes',
    description: '예측할 시간대들 (쉼표로 구분)',
    required: false,
    example: '1h,4h,24h,1w'
  })
  @ApiQuery({
    name: 'forceRefresh',
    description: '강제 새로고침 여부',
    required: false,
    type: Boolean
  })
  @ApiResponse({
    status: 200,
    description: '가격 예측 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseResponseDto' },
        {
          properties: {
            result_data: {
              type: 'object',
              properties: {
                symbol: { type: 'string', example: 'BTCUSDT' },
                currentPrice: { type: 'string', example: '43250.50' },
                predictions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      timeframe: { type: 'string', example: '1h' },
                      predictedPrice: { type: 'string', example: '43500.00' },
                      confidence: { type: 'number', example: 75 },
                      changePercent: { type: 'number', example: 0.58 },
                      trend: { type: 'string', example: 'bullish' },
                      explanation: { type: 'string', example: '단기 상승 모멘텀' }
                    }
                  }
                },
                supportLevels: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['43000', '42500', '42000']
                },
                resistanceLevels: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['44000', '44500', '45000']
                },
                confidence: { type: 'number', example: 72 },
                analysis: {
                  type: 'object',
                  properties: {
                    marketSentiment: { type: 'string', example: 'bullish' },
                    keyFactors: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['긍정적인 기술적 지표', '거래량 증가']
                    },
                    riskFactors: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['시장 변동성', '규제 불확실성']
                    },
                    recommendation: { type: 'string', example: '소량 매수 진입 고려' },
                    disclaimer: { type: 'string', example: '이 예측은 투자 조언이 아닙니다.' }
                  }
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 심볼 또는 요청'
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async getPricePrediction(
    @Param('symbol') symbol: string,
    @Query('timeframes') timeframes?: string,
    @Query('forceRefresh') forceRefresh?: boolean
  ): Promise<BaseResponseDto> {
    // 쿼리 파라미터 처리
    const timeframeArray = timeframes ? timeframes.split(',').map(t => t.trim()) : undefined;
    
    // 유스케이스를 호출하여 비즈니스 로직 실행
    const result = await this.predictPriceUseCase.execute({
      symbol,
      timeframes: timeframeArray,
      forceRefresh: forceRefresh === true
    });

    return this.success(result, `${symbol} 가격 예측 완료`);
  }

  /**
   * 암호화폐 가격 예측 API (POST 방식)
   * 
   * POST 요청 본문을 통해 더 상세한 예측 옵션을 설정할 수 있습니다.
   * 
   * @param symbol 예측할 암호화폐 심볼
   * @param body 예측 옵션들
   * @returns 가격 예측 정보와 분석 결과
   */
  @Post(':symbol')
  @ApiOperation({
    summary: '암호화폐 가격 예측 (POST)',
    description: 'POST 요청을 통해 상세한 예측 옵션을 설정하여 가격 예측을 수행합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '암호화폐 심볼 (예: BTCKRW, ETHKRW)',
    example: 'BTCKRW'
  })
  @ApiBody({
    description: '예측 옵션',
    schema: {
      type: 'object',
      properties: {
        timeframes: {
          type: 'array',
          items: { type: 'string' },
          description: '예측할 시간대들',
          example: ['1h', '4h', '24h', '1w', '1m', '3m']
        },
        forceRefresh: {
          type: 'boolean',
          description: '강제 새로고침 여부',
          example: false
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '가격 예측 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseResponseDto' },
        {
          properties: {
            result_data: {
              type: 'object',
              properties: {
                symbol: { type: 'string', example: 'BTCUSDT' },
                currentPrice: { type: 'string', example: '43250.50' },
                predictions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      timeframe: { type: 'string', example: '1h' },
                      predictedPrice: { type: 'string', example: '43500.00' },
                      confidence: { type: 'number', example: 75 },
                      changePercent: { type: 'number', example: 0.58 },
                      trend: { type: 'string', example: 'bullish' },
                      explanation: { type: 'string', example: '단기 상승 모멘텀' }
                    }
                  }
                },
                supportLevels: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['43000', '42500', '42000']
                },
                resistanceLevels: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['44000', '44500', '45000']
                },
                confidence: { type: 'number', example: 72 },
                analysis: {
                  type: 'object',
                  properties: {
                    marketSentiment: { type: 'string', example: 'bullish' },
                    keyFactors: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['긍정적인 기술적 지표', '거래량 증가']
                    },
                    riskFactors: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['시장 변동성', '규제 불확실성']
                    },
                    recommendation: { type: 'string', example: '소량 매수 진입 고려' },
                    disclaimer: { type: 'string', example: '이 예측은 투자 조언이 아닙니다.' }
                  }
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청'
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류'
  })
  async postPricePrediction(
    @Param('symbol') symbol: string,
    @Body() body: { timeframes?: string[]; forceRefresh?: boolean }
  ): Promise<BaseResponseDto> {
    // 유스케이스를 호출하여 비즈니스 로직 실행
    const result = await this.predictPriceUseCase.execute({
      symbol,
      timeframes: body.timeframes,
      forceRefresh: body.forceRefresh
    });

    return this.success(result, `${symbol} 가격 예측 완료`);
  }
} 