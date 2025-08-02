import { Test, TestingModule } from '@nestjs/testing';
import { AnalyzeTechnicalSimpleUseCase } from './analyze-technical-simple.use-case';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { Price } from '../../domain/entities/price.entity';
import { TechnicalAnalysis } from '../../domain/entities/technical-analysis.entity';

describe('AnalyzeTechnicalSimpleUseCase', () => {
  let useCase: AnalyzeTechnicalSimpleUseCase;
  let mockBinanceRepository: jest.Mocked<BinanceRepository>;
  let mockAiRepository: jest.Mocked<AiRepository>;

  beforeEach(async () => {
    const mockBinanceRepo = {
      getCurrentPrice: jest.fn(),
    };

    const mockAiRepo = {
      analyzeTechnicalIndicators: jest.fn(),
      isConnected: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeTechnicalSimpleUseCase,
        {
          provide: 'BinanceRepository',
          useValue: mockBinanceRepo,
        },
        {
          provide: 'AiRepository',
          useValue: mockAiRepo,
        },
      ],
    }).compile();

    useCase = module.get<AnalyzeTechnicalSimpleUseCase>(AnalyzeTechnicalSimpleUseCase);
    mockBinanceRepository = module.get('BinanceRepository');
    mockAiRepository = module.get('AiRepository');
  });

  describe('execute', () => {
    it('should return technical analysis for valid symbol', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const priceData = new Price(symbol, '50000', Date.now());
      const mockAnalysis = TechnicalAnalysis.create(
        symbol,
        '50000',
        {
          rsi: 65,
          macd: 150,
          macdSignal: 140,
          bollingerUpper: '51000',
          bollingerLower: '49000',
          ma20: '50000',
          ma50: '49500',
          volume: '1000000',
          volumeChange: '5'
        },
        {
          rsi: { value: 65, signal: 'neutral' as const, explanation: 'RSI 분석' },
          macd: { value: 150, signal: 'buy' as const, explanation: 'MACD 분석' },
          bollinger: { position: 'middle' as const, signal: 'neutral' as const, explanation: '볼린저 분석' },
          movingAverages: { signal: 'buy' as const, explanation: '이동평균 분석' },
          overallSignal: 'buy' as const,
          confidence: 75,
          simpleAdvice: '소량 매수 고려',
          riskLevel: 'medium' as const,
          riskExplanation: '중간 위험도'
        }
      );

      mockBinanceRepository.getCurrentPrice.mockResolvedValue(priceData);
      mockAiRepository.analyzeTechnicalIndicators.mockResolvedValue(mockAnalysis);

      // Act
      const result = await useCase.execute({ symbol });

      // Assert
      expect(result.result).toBe(true);
      expect(result.result_data.symbol).toBe(symbol);
      expect(result.result_data.price).toBe('50000');
      expect(result.result_data.analysis).toEqual(mockAnalysis.analysis);
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith(symbol);
      expect(mockAiRepository.analyzeTechnicalIndicators).toHaveBeenCalled();
    });

    it('should normalize symbol to uppercase', async () => {
      // Arrange
      const symbol = 'btcusdt';
      const priceData = new Price('BTCUSDT', '50000', Date.now());
      const mockAnalysis = TechnicalAnalysis.create(
        'BTCUSDT',
        '50000',
        {
          rsi: 65,
          macd: 150,
          macdSignal: 140,
          bollingerUpper: '51000',
          bollingerLower: '49000',
          ma20: '50000',
          ma50: '49500',
          volume: '1000000',
          volumeChange: '5'
        },
        {
          rsi: { value: 65, signal: 'neutral' as const, explanation: 'RSI 분석' },
          macd: { value: 150, signal: 'buy' as const, explanation: 'MACD 분석' },
          bollinger: { position: 'middle' as const, signal: 'neutral' as const, explanation: '볼린저 분석' },
          movingAverages: { signal: 'buy' as const, explanation: '이동평균 분석' },
          overallSignal: 'buy' as const,
          confidence: 75,
          simpleAdvice: '소량 매수 고려',
          riskLevel: 'medium' as const,
          riskExplanation: '중간 위험도'
        }
      );

      mockBinanceRepository.getCurrentPrice.mockResolvedValue(priceData);
      mockAiRepository.analyzeTechnicalIndicators.mockResolvedValue(mockAnalysis);

      // Act
      const result = await useCase.execute({ symbol });

      // Assert
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith('BTCUSDT');
      expect(result.result_data.symbol).toBe('BTCUSDT');
    });

    it('should handle Binance API error', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      mockBinanceRepository.getCurrentPrice.mockRejectedValue(new Error('Binance API Error'));

      // Act
      const result = await useCase.execute({ symbol });

      // Assert
      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
      expect(result.msg).toContain('BTCUSDT 기술적 분석 실패');
    });

    it('should handle AI analysis error', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const priceData = new Price(symbol, '50000', Date.now());
      
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(priceData);
      mockAiRepository.analyzeTechnicalIndicators.mockRejectedValue(new Error('AI Analysis Error'));

      // Act
      const result = await useCase.execute({ symbol });

      // Assert
      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
      expect(result.msg).toContain('BTCUSDT 기술적 분석 실패');
    });

    it('should pass correct technical data to AI repository', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const priceData = new Price(symbol, '50000', Date.now());
      const mockAnalysis = TechnicalAnalysis.create(
        symbol,
        '50000',
        {
          rsi: 65,
          macd: 150,
          macdSignal: 140,
          bollingerUpper: '51000',
          bollingerLower: '49000',
          ma20: '50000',
          ma50: '49500',
          volume: '1000000',
          volumeChange: '5'
        },
        {
          rsi: { value: 65, signal: 'neutral' as const, explanation: 'RSI 분석' },
          macd: { value: 150, signal: 'buy' as const, explanation: 'MACD 분석' },
          bollinger: { position: 'middle' as const, signal: 'neutral' as const, explanation: '볼린저 분석' },
          movingAverages: { signal: 'buy' as const, explanation: '이동평균 분석' },
          overallSignal: 'buy' as const,
          confidence: 75,
          simpleAdvice: '소량 매수 고려',
          riskLevel: 'medium' as const,
          riskExplanation: '중간 위험도'
        }
      );

      mockBinanceRepository.getCurrentPrice.mockResolvedValue(priceData);
      mockAiRepository.analyzeTechnicalIndicators.mockResolvedValue(mockAnalysis);

      // Act
      await useCase.execute({ symbol });

      // Assert
      expect(mockAiRepository.analyzeTechnicalIndicators).toHaveBeenCalledWith(
        'BTCUSDT',
        '50000',
        {
          rsi: 50,
          macd: 0,
          macdSignal: 0,
          bollingerUpper: '51000',
          bollingerLower: '49000',
          ma20: '50000',
          ma50: '50000',
          volume: '1000000',
          volumeChange: '0'
        }
      );
    });

    it('should return success message with symbol', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const priceData = new Price(symbol, '50000', Date.now());
      const mockAnalysis = TechnicalAnalysis.create(
        symbol,
        '50000',
        {
          rsi: 65,
          macd: 150,
          macdSignal: 140,
          bollingerUpper: '51000',
          bollingerLower: '49000',
          ma20: '50000',
          ma50: '49500',
          volume: '1000000',
          volumeChange: '5'
        },
        {
          rsi: { value: 65, signal: 'neutral' as const, explanation: 'RSI 분석' },
          macd: { value: 150, signal: 'buy' as const, explanation: 'MACD 분석' },
          bollinger: { position: 'middle' as const, signal: 'neutral' as const, explanation: '볼린저 분석' },
          movingAverages: { signal: 'buy' as const, explanation: '이동평균 분석' },
          overallSignal: 'buy' as const,
          confidence: 75,
          simpleAdvice: '소량 매수 고려',
          riskLevel: 'medium' as const,
          riskExplanation: '중간 위험도'
        }
      );

      mockBinanceRepository.getCurrentPrice.mockResolvedValue(priceData);
      mockAiRepository.analyzeTechnicalIndicators.mockResolvedValue(mockAnalysis);

      // Act
      const result = await useCase.execute({ symbol });

      // Assert
      expect(result.msg).toBe('BTCUSDT 기술적 분석 완료');
    });
  });
}); 