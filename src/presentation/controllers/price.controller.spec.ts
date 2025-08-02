import { Test, TestingModule } from '@nestjs/testing';
import { PriceController } from './price.controller';
import { GetPriceUseCase } from '../../application/use-cases/get-price.use-case';
import { BaseResponse } from '../../shared/base-response';
import { Price } from '../../domain/entities/price.entity';

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
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: '메모리에서 BTCUSDT 가격 조회 완료',
        result_data: {
          symbol: 'BTCUSDT',
          price: '50000',
          source: 'memory',
          age: 5000
        },
        code: 'S001'
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getPrice(symbol, false);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol,
        forceRefresh: false
      });
    });

    it('should handle forceRefresh parameter', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: 'API에서 BTCUSDT 가격 조회 완료',
        result_data: {
          symbol: 'BTCUSDT',
          price: '51000',
          source: 'api'
        },
        code: 'S001'
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getPrice(symbol, true);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol,
        forceRefresh: true
      });
    });

    it('should handle use case errors', async () => {
      // Arrange
      const symbol = 'INVALID';
      const mockResponse: BaseResponse<any> = {
        result: false,
        msg: 'INVALID 가격 조회 실패',
        result_data: null,
        code: 'E500'
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getPrice(symbol, false);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
    });

    it('should normalize symbol to uppercase', async () => {
      // Arrange
      const symbol = 'btcusdt';
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: '메모리에서 BTCUSDT 가격 조회 완료',
        result_data: {
          symbol: 'BTCUSDT',
          price: '50000',
          source: 'memory'
        },
        code: 'S001'
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      await controller.getPrice(symbol, false);

      // Assert
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol: 'btcusdt',
        forceRefresh: false
      });
    });

    it('should handle undefined forceRefresh parameter', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const mockResponse: BaseResponse<any> = {
        result: true,
        msg: '메모리에서 BTCUSDT 가격 조회 완료',
        result_data: {
          symbol: 'BTCUSDT',
          price: '50000',
          source: 'memory'
        },
        code: 'S001'
      };

      mockGetPriceUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getPrice(symbol, undefined);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockGetPriceUseCase.execute).toHaveBeenCalledWith({
        symbol,
        forceRefresh: false
      });
    });
  });
}); 