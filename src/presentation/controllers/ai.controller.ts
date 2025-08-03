/**
 * AI 분석 컨트롤러
 * 
 * 이 클래스는 Clean Architecture의 Presentation Layer에 위치하며,
 * HTTP 요청을 받아서 AI 분석 기능을 제공합니다.
 * 
 * 주요 기능:
 * - AI 기반 암호화폐 기술적 분석 API 제공
 * - Swagger 문서 자동 생성
 * - 요청/응답 데이터 검증
 * - 에러 처리 및 로깅
 * 
 * Clean Architecture에서의 역할:
 * - Presentation Layer에 위치
 * - HTTP 요청/응답 처리만 담당
 * - 비즈니스 로직은 Use Case에 위임
 * - 외부 시스템과 직접적인 통신 없음
 * 
 * API 엔드포인트:
 * - POST /ai/technical-analysis: 기술적 분석 수행
 * 
 * 사용 예시:
 * ```bash
 * curl -X POST http://localhost:3000/ai/technical-analysis \
 *   -H "Content-Type: application/json" \
 *   -d '{"symbol": "BTCUSDT"}'
 * ```
 */
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { BaseService } from '../../shared/base-response';
import { AnalyzeTechnicalSimpleUseCase } from '../../application/use-cases/analyze-technical-simple.use-case';
import Logger from '../../shared/logger';

/**
 * AI 분석 API 그룹
 * 
 * @ApiTags 데코레이터 설명:
 * - Swagger UI에서 API들을 그룹화하는 데 사용
 * - 'AI Analysis' 그룹으로 분류되어 관리됨
 * - 관련된 API들을 논리적으로 묶어서 문서화
 */
@ApiTags('AI Analysis')
@Controller('ai')
export class AiController extends BaseService {

  /**
   * 생성자 - 의존성 주입
   * 
   * @param analyzeTechnicalSimpleUseCase - 기술적 분석 Use Case
   * 
   * 의존성 주입 설명:
   * - NestJS의 DI 컨테이너가 자동으로 Use Case 인스턴스를 주입
   * - private readonly로 선언하여 외부에서 수정 불가능하게 만듦
   * - Clean Architecture에서 Presentation Layer가 Application Layer에 의존
   */
  constructor(
    private readonly analyzeTechnicalSimpleUseCase: AnalyzeTechnicalSimpleUseCase,
  ) {
    // 부모 클래스(BaseService) 생성자 호출
    super();
  }

  /**
   * AI 기반 기술적 분석 API 엔드포인트
   * 
   * @param body - 요청 본문 (symbol 포함)
   * @returns BaseResponseDto - 분석 결과
   * 
   * HTTP 메서드: POST
   * 경로: /ai/technical-analysis
   * 
   * 동작 과정:
   * 1. 요청 로깅
   * 2. Use Case 실행
   * 3. 결과 반환
   * 4. 에러 처리
   * 
   * Swagger 문서화:
   * - @ApiOperation: API 설명 및 요약
   * - @ApiBody: 요청 본문 스키마 정의
   * - @ApiResponse: 응답 스키마 정의 (성공/실패 케이스)
   */
  @Post('technical-analysis')
  @ApiOperation({ 
    summary: 'AI 기반 암호화폐 기술적 분석',
    description: '바이낸스 API를 통해 실시간 가격 데이터를 가져와서 Google Gemini AI로 분석을 수행합니다. 현재 가격과 24시간 변화율을 기반으로 매매 신호와 위험도를 제공합니다.'
  })
  @ApiBody({ 
    description: '분석할 암호화폐 심볼 정보',
    schema: {
      type: 'object',
      required: ['symbol'], // 필수 필드 정의
      properties: {
        symbol: {
          type: 'string',
          description: '분석할 암호화폐 심볼',
          example: 'BTCUSDT',
          enum: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'] // 허용된 값들
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '기술적 분석 완료',
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResponseDto) }, // 기본 응답 스키마 참조
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
      // 요청 로깅 (디버깅 및 모니터링용)
      Logger.info(`Technical analysis requested for symbol: ${body.symbol}`);

      // Use Case 실행
      // Clean Architecture에서 비즈니스 로직은 Use Case에 위임
      const result = await this.analyzeTechnicalSimpleUseCase.execute({
        symbol: body.symbol
      });

      // 결과 반환
      return result;
    } catch (error) {
      // 에러 발생 시 로깅 및 에러 응답 반환
      Logger.error(`Error in technical analysis: ${error.message}`);
      
      // BaseService의 fail 메서드를 사용하여 표준화된 에러 응답 생성
      return this.fail(error.message || '기술적 분석 중 오류가 발생했습니다.');
    }
  }
} 