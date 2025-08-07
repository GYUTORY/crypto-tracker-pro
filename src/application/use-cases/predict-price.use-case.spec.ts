/**
 * 가격 예측 유스케이스 테스트
 */
import { Test, TestingModule } from '@nestjs/testing';
import { PredictPriceUseCase } from './predict-price.use-case';
import { PricePrediction, TimeframePrediction } from '../../domain/entities/price-prediction.entity';
import { TechnicalData } from '../../domain/entities/technical-analysis.entity';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { Price } from '../../domain/entities/price.entity';

describe('PredictPriceUseCase', () => {
  let useCase: PredictPriceUseCase;
  let mockAiRepository: jest.Mocked<AiRepository>;
  let mockBinanceRepository: jest.Mocked<BinanceRepository>;

  const mockTechnicalData: TechnicalData = {
    rsi: 55,
    macd: 150,
    macdSignal: 100,
    bollingerUpper: '45000',
    bollingerLower: '43000',
    ma20: '44000',
    ma50: '43500',
    volume: '1000000',
    volumeChange: '5.2'
  };

  const mockTimeframePredictions: TimeframePrediction[] = [
    {
      timeframe: '1h',
      predictedPrice: '43500.00',
      confidence: 75,
      changePercent: 0.58,
      trend: 'bullish',
      explanation: '단기 상승 모멘텀'
    },
    {
      timeframe: '4h',
      predictedPrice: '43800.00',
      confidence: 70,
      changePercent: 1.27,
      trend: 'bullish',
      explanation: '중기 상승 추세'
    }
  ];

  const mockPricePrediction = new PricePrediction(
    'BTCKRW',
    '43250000',
    mockTimeframePredictions,
    ['43000000', '42500000'],
    ['44000000', '44500000'],
    72,
    Date.now(),
    {
      marketSentiment: 'bullish',
      keyFactors: ['긍정적인 기술적 지표', '거래량 증가'],
      riskFactors: ['시장 변동성', '규제 불확실성'],
      recommendation: '소량 매수 진입 고려',
      disclaimer: '이 예측은 투자 조언이 아닙니다.'
    }
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictPriceUseCase,
        {
          provide: 'AiRepository',
          useValue: {
            predictPrice: jest.fn(),
            analyzeTechnicalIndicators: jest.fn(),
            isConnected: jest.fn()
          }
        },
        {
          provide: 'BinanceRepository',
          useValue: {
            getCurrentPrice: jest.fn(),
            isWebSocketConnected: jest.fn(),
            reconnectWebSocket: jest.fn()
          }
        }
      ],
    }).compile();

    useCase = module.get<PredictPriceUseCase>(PredictPriceUseCase);
    mockAiRepository = module.get('AiRepository');
    mockBinanceRepository = module.get('BinanceRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully predict price', async () => {
      // Given
      const request = { symbol: 'BTCKRW' };
      const mockPrice = new Price('BTCKRW', '43250000', Date.now());
      
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(mockPrice);
      mockAiRepository.predictPrice.mockResolvedValue(mockPricePrediction);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.result).toBe(true);
      expect(result.result_data.symbol).toBe('BTCKRW');
      expect(result.result_data.currentPrice).toBe('43250000');
      expect(result.result_data.predictions).toHaveLength(2);
      expect(result.result_data.confidence).toBe(72);
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith('BTCKRW');
      expect(mockAiRepository.predictPrice).toHaveBeenCalledWith(
        'BTCKRW',
        '43250000',
        expect.any(Object)
      );
    });

    it('should handle specific timeframes', async () => {
      // Given
      const request = { 
        symbol: 'BTCKRW', 
        timeframes: ['1h', '24h'] 
      };
      const mockPrice = new Price('BTCKRW', '43250000', Date.now());
      
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(mockPrice);
      mockAiRepository.predictPrice.mockResolvedValue(mockPricePrediction);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.result).toBe(true);
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith('BTCKRW');
    });

    it('should handle force refresh', async () => {
      // Given
      const request = { 
        symbol: 'BTCKRW', 
        forceRefresh: true 
      };
      const mockPrice = new Price('BTCKRW', '43250000', Date.now());
      
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(mockPrice);
      mockAiRepository.predictPrice.mockResolvedValue(mockPricePrediction);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.result).toBe(true);
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith('BTCKRW');
      expect(mockAiRepository.predictPrice).toHaveBeenCalled();
    });

    it('should handle AI repository error', async () => {
      // Given
      const request = { symbol: 'BTCKRW' };
      const mockPrice = new Price('BTCKRW', '43250000', Date.now());
      
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(mockPrice);
      mockAiRepository.predictPrice.mockRejectedValue(new Error('AI service error'));

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.result).toBe(false);
      expect(result.msg).toContain('BTCKRW 가격 예측 실패');
    });

    it('should handle Binance repository error', async () => {
      // Given
      const request = { symbol: 'BTCKRW' };
      
      mockBinanceRepository.getCurrentPrice.mockRejectedValue(new Error('Binance API error'));

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.result).toBe(false);
      expect(result.msg).toContain('BTCKRW 가격 예측 실패');
    });

    it('should convert symbol to uppercase', async () => {
      // Given
      const request = { symbol: 'btckrw' };
      const mockPrice = new Price('BTCKRW', '43250000', Date.now());
      
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(mockPrice);
      mockAiRepository.predictPrice.mockResolvedValue(mockPricePrediction);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith('BTCKRW');
      expect(mockAiRepository.predictPrice).toHaveBeenCalledWith(
        'BTCKRW',
        '43250000',
        expect.any(Object)
      );
    });
  });
}); 