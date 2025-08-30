import { Test, TestingModule } from '@nestjs/testing';
import { GetPriceUseCase } from './get-price.use-case';
import { PriceRepository } from '../../domain/repositories/price-repository.interface';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { Price } from '../../domain/entities/price.entity';

describe('GetPriceUseCase', () => {
  let useCase: GetPriceUseCase;
  let mockPriceRepository: jest.Mocked<PriceRepository>;
  let mockBinanceRepository: jest.Mocked<BinanceRepository>;

  beforeEach(async () => {
    const mockPriceRepo = {
      findBySymbol: jest.fn(),
      save: jest.fn(),
    };

    const mockBinanceRepo = {
      getCurrentPrice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPriceUseCase,
        {
          provide: 'PriceRepository',
          useValue: mockPriceRepo,
        },
        {
          provide: 'BinanceRepository',
          useValue: mockBinanceRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetPriceUseCase>(GetPriceUseCase);
    mockPriceRepository = module.get('PriceRepository');
    mockBinanceRepository = module.get('BinanceRepository');
  });

  describe('execute', () => {
    it('should return price from memory when available and not expired', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockPrice = new Price(symbol, '50000', Date.now());
      mockPriceRepository.findBySymbol.mockResolvedValue(mockPrice);

      // Act
      const result = await useCase.execute({ symbol, forceRefresh: false });

      // Assert
      expect(result.symbol).toBe(symbol);
      expect(result.price).toBe('50000');
      expect(result.source).toBe('memory');
      expect(mockPriceRepository.findBySymbol).toHaveBeenCalledWith(symbol);
      expect(mockBinanceRepository.getCurrentPrice).not.toHaveBeenCalled();
    });

    it('should return price from API when memory data is expired', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const expiredPrice = new Price(symbol, '50000', Date.now() - 60000); // 1분 전
      const apiPrice = new Price(symbol, '51000', Date.now());
      
      mockPriceRepository.findBySymbol.mockResolvedValue(expiredPrice);
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(apiPrice);
      mockPriceRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute({ symbol, forceRefresh: false });

      // Assert
      expect(result.symbol).toBe(symbol);
      expect(result.price).toBe('51000');
      expect(result.source).toBe('api');
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith(symbol);
      expect(mockPriceRepository.save).toHaveBeenCalledWith(apiPrice);
    });

    it('should return price from API when forceRefresh is true', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const memoryPrice = new Price(symbol, '50000', Date.now());
      const apiPrice = new Price(symbol, '51000', Date.now());
      
      mockPriceRepository.findBySymbol.mockResolvedValue(memoryPrice);
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(apiPrice);
      mockPriceRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute({ symbol, forceRefresh: true });

      // Assert
      expect(result.source).toBe('api');
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith(symbol);
      expect(mockPriceRepository.save).toHaveBeenCalledWith(apiPrice);
    });

    it('should return price from API when no data in memory', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const apiPrice = new Price(symbol, '51000', Date.now());
      
      mockPriceRepository.findBySymbol.mockResolvedValue(null);
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(apiPrice);
      mockPriceRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute({ symbol, forceRefresh: false });

      // Assert
      expect(result.source).toBe('api');
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith(symbol);
    });

    it('should handle API error gracefully', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      mockPriceRepository.findBySymbol.mockResolvedValue(null);
      mockBinanceRepository.getCurrentPrice.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(useCase.execute({ symbol, forceRefresh: false }))
        .rejects.toThrow('BTCUSDT 가격 조회 실패');
    });

    it('should normalize symbol to uppercase', async () => {
      // Arrange
      const symbol = 'btcusdt';
      const apiPrice = new Price('BTCUSDT', '51000', Date.now());
      
      mockPriceRepository.findBySymbol.mockResolvedValue(null);
      mockBinanceRepository.getCurrentPrice.mockResolvedValue(apiPrice);
      mockPriceRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute({ symbol, forceRefresh: false });

      // Assert
      expect(mockPriceRepository.findBySymbol).toHaveBeenCalledWith('BTCUSDT');
      expect(mockBinanceRepository.getCurrentPrice).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should return age when data is from memory', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockPrice = new Price(symbol, '50000', Date.now() - 10000); // 10초 전
      mockPriceRepository.findBySymbol.mockResolvedValue(mockPrice);

      // Act
      const result = await useCase.execute({ symbol, forceRefresh: false });

      // Assert
      expect(result.age).toBeDefined();
      expect(typeof result.age).toBe('number');
    });
  });
}); 