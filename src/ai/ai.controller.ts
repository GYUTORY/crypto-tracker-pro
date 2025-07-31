import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { BaseResponseDto } from '../dto/base-response.dto';

import Logger from '../Logger';

@ApiTags('AI Analysis')
@Controller('ai')
export class AiController {

  constructor(
    private readonly aiService: AiService,
    private readonly technicalAnalysisService: TechnicalAnalysisService,
  ) {}

  @Post('technical-analysis')
  @ApiOperation({ 
    summary: 'AI 기반 암호화폐 기술적 분석',
    description: '바이낸스 API를 통해 실시간 가격 데이터를 가져와서 Google Gemini AI로 분석을 수행합니다. 현재 가격과 24시간 변화율을 기반으로 매매 신호와 위험도를 제공합니다.'
  })
  @ApiBody({ 
    description: '분석할 암호화폐 심볼 정보',
    schema: {
      type: 'object',
      required: ['symbol'],
      properties: {
        symbol: {
          type: 'string',
          description: '분석할 암호화폐 심볼',
          example: 'BTCUSDT',
          enum: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '기술적 분석 완료',
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResponseDto) },
        {
          properties: {
            result_data: {
              type: 'object',
              description: 'AI 분석 결과',
              properties: {
                rsi: {
                  type: 'object',
                  properties: {
                    value: { type: 'number', example: 65.5 },
                    signal: { type: 'string', example: 'neutral', enum: ['buy', 'sell', 'neutral'] },
                    explanation: { type: 'string', example: 'RSI가 중립 구간에 위치하고 있습니다.' }
                  }
                },
                macd: {
                  type: 'object',
                  properties: {
                    value: { type: 'number', example: 150.5 },
                    signal: { type: 'string', example: 'buy', enum: ['buy', 'sell', 'neutral'] },
                    explanation: { type: 'string', example: 'MACD가 시그널선을 상향 돌파했습니다.' }
                  }
                },
                bollinger: {
                  type: 'object',
                  properties: {
                    position: { type: 'string', example: 'middle', enum: ['upper', 'middle', 'lower'] },
                    signal: { type: 'string', example: 'neutral', enum: ['buy', 'sell', 'neutral'] },
                    explanation: { type: 'string', example: '가격이 볼린저 밴드 중간에 위치합니다.' }
                  }
                },
                movingAverages: {
                  type: 'object',
                  properties: {
                    signal: { type: 'string', example: 'buy', enum: ['buy', 'sell', 'neutral'] },
                    explanation: { type: 'string', example: '단기 이동평균이 장기 이동평균을 상향 돌파했습니다.' }
                  }
                },
                overallSignal: { type: 'string', example: 'buy', enum: ['buy', 'sell', 'neutral'] },
                confidence: { type: 'number', example: 75 },
                simpleAdvice: { type: 'string', example: '현재 시장 상황을 보면 소량 매수 진입을 고려해볼 수 있습니다.' },
                riskLevel: { type: 'string', example: 'medium', enum: ['low', 'medium', 'high'] },
                riskExplanation: { type: 'string', example: '변동성이 다소 높아 주의가 필요합니다.' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 (심볼이 없거나 잘못된 형식)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResponseDto) },
        {
          properties: {
            result: { example: false },
            msg: { example: '심볼이 필요합니다.' },
            code: { example: 'E400' }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: '서버 오류 (AI 분석 실패 또는 외부 API 오류)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResponseDto) },
        {
          properties: {
            result: { example: false },
            msg: { example: 'AI 분석 중 오류가 발생했습니다.' },
            code: { example: 'E500' }
          }
        }
      ]
    }
  })
  async technicalAnalysis(@Body() body: any): Promise<BaseResponseDto> {
    try {
      Logger.info(`Technical analysis requested for symbol: ${body.symbol}`);

      // 기술적 지표 계산
      const indicators = await this.technicalAnalysisService.getTechnicalIndicators(body.symbol);
      
      // AI 분석 수행
      const analysis = await this.aiService.analyzeTechnicalIndicators(indicators);

      return {
        result: true,
        msg: 'Technical analysis completed successfully',
        result_data: analysis,
        code: 'S001',
      };
    } catch (error) {
      Logger.error(`Error in technical analysis: ${error.message}`);
      return {
        result: false,
        msg: error.message || '기술적 분석 중 오류가 발생했습니다.',
        result_data: null,
        code: 'E500',
      };
    }
  }
} 