import { Test, TestingModule } from '@nestjs/testing';
import { BinanceService } from './binance.service';
import { PriceStoreService } from '../tcp/price-store.service';
import axios from 'axios';

// axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BinanceService', () => {
  let service: BinanceService;
  let priceStoreService: PriceStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinanceService,
        {
          provide: PriceStoreService,
          useValue: {
            getPrice: jest.fn(),
            setPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BinanceService>(BinanceService);
    priceStoreService = module.get<PriceStoreService>(PriceStoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentPrice', () => {
    it('should return price from memory when available', async () => {
      const mockPriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now(),
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(mockPriceData);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(true);
      expect(result.result_data).toEqual({
        symbol: 'BTCUSDT',
        price: '50000.00',
      });
      expect(result.msg).toContain('memory');
      expect(result.code).toBe('S001');
      expect(priceStoreService.getPrice).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should convert symbol to uppercase when checking memory', async () => {
      const mockPriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now(),
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(mockPriceData);

      await service.getCurrentPrice('btcusdt');

      expect(priceStoreService.getPrice).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should fetch from API when not in memory', async () => {
      const mockApiResponse = {
        data: {
          symbol: 'ETHUSDT',
          price: '3000.00',
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const result = await service.getCurrentPrice('ETHUSDT');

      expect(result.result).toBe(true);
      expect(result.result_data).toEqual({
        symbol: 'ETHUSDT',
        price: '3000.00',
      });
      expect(result.msg).toContain('API');
      expect(result.code).toBe('S001');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.binance.com/api/v3/ticker/price',
        { params: { symbol: 'ETHUSDT' } }
      );
    });

    it('should store API response in memory', async () => {
      const mockApiResponse = {
        data: {
          symbol: 'BTCUSDT',
          price: '50000.00',
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      await service.getCurrentPrice('BTCUSDT');

      expect(priceStoreService.setPrice).toHaveBeenCalledWith({
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: expect.any(Number),
      });
    });

    it('should handle invalid symbol error from API', async () => {
      const mockError = {
        response: {
          status: 400,
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await service.getCurrentPrice('INVALID');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Invalid symbol');
      expect(result.code).toBe('E400');
      expect(result.result_data).toBeNull();
    });

    it('should handle API request failure', async () => {
      const mockError = new Error('Network error');

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Failed to fetch price');
      expect(result.code).toBe('E500');
      expect(result.result_data).toBeNull();
    });

    it('should handle API response without data property', async () => {
      const mockApiResponse = {
        data: null,
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Failed to fetch price');
      expect(result.code).toBe('E500');
    });

    it('should handle empty symbol parameter', async () => {
      const result = await service.getCurrentPrice('');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Failed to fetch price');
      expect(result.code).toBe('E500');
    });



    it('should handle API timeout error', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'Request timeout',
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Failed to fetch price');
      expect(result.code).toBe('E500');
    });

    it('should handle API rate limit error', async () => {
      const mockError = {
        response: {
          status: 429,
          data: { msg: 'Rate limit exceeded' },
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Failed to fetch price');
      expect(result.code).toBe('E500');
    });

    it('should handle API server error', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { msg: 'Internal server error' },
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(false);
      expect(result.msg).toContain('Failed to fetch price');
      expect(result.code).toBe('E500');
    });

    it('should handle API response with missing symbol', async () => {
      const mockApiResponse = {
        data: {
          price: '50000.00',
          // symbol missing
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(true);
      expect(result.msg).toContain('API');
      expect(result.code).toBe('S001');
    });

    it('should handle API response with missing price', async () => {
      const mockApiResponse = {
        data: {
          symbol: 'BTCUSDT',
          // price missing
        },
      };

      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(true);
      expect(result.msg).toContain('API');
      expect(result.code).toBe('S001');
    });

    it('should handle different symbol formats', async () => {
      const symbols = ['btcusdt', 'BTCUSDT', 'BtcUsdt', 'btc-usdt'];
      
      for (const symbol of symbols) {
        const mockPriceData = {
          symbol: 'BTCUSDT',
          price: '50000.00',
          timestamp: Date.now(),
        };

        jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(mockPriceData);

        const result = await service.getCurrentPrice(symbol);

        expect(result.result).toBe(true);
        expect(result.result_data.symbol).toBe('BTCUSDT');
        expect(priceStoreService.getPrice).toHaveBeenCalledWith('BTCUSDT');
      }
    });
  });

  describe('error handling edge cases', () => {
    it('should handle axios throwing non-error objects', async () => {
      jest.spyOn(priceStoreService, 'getPrice').mockReturnValue(null);
      mockedAxios.get.mockRejectedValue('String error');

      const result = await service.getCurrentPrice('BTCUSDT');

      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
    });


  });
}); 