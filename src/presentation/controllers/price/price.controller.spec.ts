import { Test, TestingModule } from '@nestjs/testing';
import { PriceController } from './price.controller';
import { GetPriceUseCase } from '@/application/use-cases/price';
import { BaseResponse } from '@/shared/base-response';
import { Price } from '@/domain/entities/price';

describe('PriceController', () => {
  let controller: PriceController;
  let mockGetPriceUseCase: jest.Mocked<GetPriceUseCase>;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceController],
      providers: [
        {
          provide: GetPriceUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<PriceController>(PriceController);
    mockGetPriceUseCase = module.get(GetPriceUseCase);
  });

  describe('getPrice', () => {
    it('should return price data for valid symbol', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockUseCaseResponse = {
        symbol: 'BTCUSDT',
        price: '50000',
        source: 'memory' as const,
        age: 5000
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      // Act
      const result = await controller.getPrice(symbol, false);

      // Assert
      expect(result.result).toBe(true);
      expect(result.msg).toBe('BTCUSDT 가격 조회 완료');
      expect(result.result_data).toEqual(mockUseCaseResponse);
      expect(result.code).toBe('S001');
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol,
        forceRefresh: false
      });
    });

    it('should handle forceRefresh parameter', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockUseCaseResponse = {
        symbol: 'BTCUSDT',
        price: '51000',
        source: 'api' as const
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      // Act
      const result = await controller.getPrice(symbol, true);

      // Assert
      expect(result.result).toBe(true);
      expect(result.msg).toBe('BTCUSDT 가격 조회 완료');
      expect(result.result_data).toEqual(mockUseCaseResponse);
      expect(result.code).toBe('S001');
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol,
        forceRefresh: true
      });
    });

    it('should handle use case errors', async () => {
      // Arrange
      const symbol = 'INVALID';
      const errorMessage = 'INVALID 가격 조회 실패';
      
      mockGetPriceUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.getPrice(symbol, false))
        .rejects.toThrow(errorMessage);
    });

    it('should normalize symbol to uppercase', async () => {
      // Arrange
      const symbol = 'btcusdt';
      const mockUseCaseResponse = {
        symbol: 'BTCUSDT',
        price: '50000',
        source: 'memory' as const
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      // Act
      const result = await controller.getPrice(symbol, false);

      // Assert
      expect(result.result).toBe(true);
      expect(result.result_data).toEqual(mockUseCaseResponse);
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol: 'btcusdt',
        forceRefresh: false
      });
    });

    it('should handle undefined forceRefresh parameter', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockUseCaseResponse = {
        symbol: 'BTCUSDT',
        price: '50000',
        source: 'memory' as const
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockUseCaseResponse);

      // Act
      const result = await controller.getPrice(symbol, undefined);

      // Assert
      expect(result.result).toBe(true);
      expect(result.result_data).toEqual(mockUseCaseResponse);
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol,
        forceRefresh: false
      });
    });
  });
}); 