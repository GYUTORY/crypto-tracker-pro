import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AnalyzeTechnicalSimpleUseCase } from '@/application/use-cases/technical-analysis';
import { BaseResponse } from '@/shared/base-response';

describe('AiController', () => {
  let controller: AiController;
  let mockAnalyzeTechnicalUseCase: jest.Mocked<AnalyzeTechnicalSimpleUseCase>;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AnalyzeTechnicalSimpleUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    mockAnalyzeTechnicalUseCase = module.get(AnalyzeTechnicalSimpleUseCase);
  });

  describe('technicalAnalysis', () => {
    it('should return technical analysis for valid symbol', async () => {
      // Arrange
      const requestBody = { symbol: 'BTCUSDT' };
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: 'BTCUSDT 기술적 분석 완료',
        result_data: {
          symbol: 'BTCUSDT',
          price: '50000',
          analysis: {
            rsi: { value: 65, signal: 'neutral', explanation: 'RSI 분석' },
            macd: { value: 150, signal: 'buy', explanation: 'MACD 분석' },
            bollinger: { position: 'middle', signal: 'neutral', explanation: '볼린저 분석' },
            movingAverages: { signal: 'buy', explanation: '이동평균 분석' },
            overallSignal: 'buy',
            confidence: 75,
            simpleAdvice: '소량 매수 고려',
            riskLevel: 'medium',
            riskExplanation: '중간 위험도'
          }
        },
        code: 'S001'
      };

      mockAnalyzeTechnicalUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.technicalAnalysis(requestBody);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAnalyzeTechnicalUseCase.execute).toHaveBeenCalledWith({
        symbol: 'BTCUSDT'
      });
    });

    it('should handle use case errors', async () => {
      // Arrange
      const requestBody = { symbol: 'INVALID' };
      const mockResponse: BaseResponse<any> = {
        result: false,
        msg: 'INVALID 기술적 분석 실패',
        result_data: null,
        code: 'E500'
      };

      mockAnalyzeTechnicalUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.technicalAnalysis(requestBody);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
    });

    it('should handle missing symbol in request body', async () => {
      // Arrange
      const requestBody = {};
      const mockResponse: BaseResponse<any> = {
        result: false,
        msg: '심볼이 필요합니다.',
        result_data: null,
        code: 'E400'
      };

      mockAnalyzeTechnicalUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.technicalAnalysis(requestBody);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.result).toBe(false);
      expect(result.code).toBe('E400');
    });

    it('should handle case insensitive symbol', async () => {
      // Arrange
      const requestBody = { symbol: 'btcusdt' };
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: 'BTCUSDT 기술적 분석 완료',
        result_data: {
          symbol: 'BTCUSDT',
          price: '50000',
          analysis: {
            rsi: { value: 65, signal: 'neutral', explanation: 'RSI 분석' },
            macd: { value: 150, signal: 'buy', explanation: 'MACD 분석' },
            bollinger: { position: 'middle', signal: 'neutral', explanation: '볼린저 분석' },
            movingAverages: { signal: 'buy', explanation: '이동평균 분석' },
            overallSignal: 'buy',
            confidence: 75,
            simpleAdvice: '소량 매수 고려',
            riskLevel: 'medium',
            riskExplanation: '중간 위험도'
          }
        },
        code: 'S001'
      };

      mockAnalyzeTechnicalUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.technicalAnalysis(requestBody);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAnalyzeTechnicalUseCase.execute).toHaveBeenCalledWith({
        symbol: 'btcusdt'
      });
    });

    it('should handle different analysis results', async () => {
      // Arrange
      const requestBody = { symbol: 'ETHUSDT' };
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: 'ETHUSDT 기술적 분석 완료',
        result_data: {
          symbol: 'ETHUSDT',
          price: '3000',
          analysis: {
            rsi: { value: 30, signal: 'buy', explanation: '과매도 구간' },
            macd: { value: -50, signal: 'sell', explanation: '하락 추세' },
            bollinger: { position: 'lower', signal: 'buy', explanation: '하단 지지선' },
            movingAverages: { signal: 'sell', explanation: '하락 추세' },
            overallSignal: 'neutral',
            confidence: 60,
            simpleAdvice: '관망 권장',
            riskLevel: 'high',
            riskExplanation: '높은 변동성'
          }
        },
        code: 'S001'
      };

      mockAnalyzeTechnicalUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.technicalAnalysis(requestBody);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.result_data.analysis.overallSignal).toBe('neutral');
      expect(result.result_data.analysis.riskLevel).toBe('high');
    });
  });
}); 