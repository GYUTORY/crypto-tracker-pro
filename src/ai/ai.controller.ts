import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { BaseResponseDto } from '../dto/base-response.dto';
import { 
  TechnicalAnalysisRequestDto, 
  TechnicalAnalysisResponseDto 
} from '../dto/technical-analysis.dto';
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
    type: TechnicalAnalysisRequestDto,
    description: '분석할 암호화폐 심볼 정보'
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
              $ref: getSchemaPath(TechnicalAnalysisResponseDto)
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
  async technicalAnalysis(@Body() body: TechnicalAnalysisRequestDto): Promise<BaseResponseDto> {
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