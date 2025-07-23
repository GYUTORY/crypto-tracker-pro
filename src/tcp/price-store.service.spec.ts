import { PriceStoreService, PriceData } from './price-store.service';

describe('PriceStoreService', () => {
  let service: PriceStoreService;

  beforeEach(() => {
    service = new PriceStoreService();
  });

  describe('setPrice', () => {
    it('should store price data correctly', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now(),
        volume: '1000.50',
        changePercent24h: '2.5'
      };

      service.setPrice(priceData);
      const retrieved = service.getPrice('BTCUSDT');

      expect(retrieved).toEqual(priceData);
    });

    it('should convert symbol to uppercase', () => {
      const priceData: PriceData = {
        symbol: 'btcusdt',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const retrieved = service.getPrice('BTCUSDT');

      expect(retrieved).toBeTruthy();
      expect(retrieved?.symbol).toBe('btcusdt'); // 원본 심볼 유지
    });

    it('should add timestamp if not provided', () => {
      const priceData = {
        symbol: 'ETHUSDT',
        price: '3000.00'
        // timestamp 없음
      } as PriceData;

      service.setPrice(priceData);
      const retrieved = service.getPrice('ETHUSDT');

      expect(retrieved).toBeTruthy();
      expect(retrieved?.timestamp).toBeDefined();
      expect(typeof retrieved?.timestamp).toBe('number');
    });

    it('should overwrite existing price data', () => {
      const initialData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const updatedData: PriceData = {
        symbol: 'BTCUSDT',
        price: '51000.00',
        timestamp: Date.now()
      };

      service.setPrice(initialData);
      service.setPrice(updatedData);

      const retrieved = service.getPrice('BTCUSDT');
      expect(retrieved?.price).toBe('51000.00');
    });
  });

  describe('getPrice', () => {
    it('should return null for non-existent symbol', () => {
      const result = service.getPrice('NONEXISTENT');
      expect(result).toBeNull();
    });

    it('should return null for expired data', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now() - 60000 // 1분 전 (30초 유효성 초과)
      };

      service.setPrice(priceData);
      const result = service.getPrice('BTCUSDT');

      expect(result).toBeNull();
    });

    it('should return valid data within expiration time', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now() - 10000 // 10초 전 (30초 유효성 내)
      };

      service.setPrice(priceData);
      const result = service.getPrice('BTCUSDT');

      expect(result).toEqual(priceData);
    });

    it('should handle case insensitive symbol lookup', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const result = service.getPrice('btcusdt');

      expect(result).toEqual(priceData);
    });
  });

  describe('getPriceWithResponse', () => {
    it('should return success response for valid data', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const result = service.getPriceWithResponse('BTCUSDT');

      expect(result.result).toBe(true);
      expect(result.result_data).toEqual(priceData);
      expect(result.code).toBe('S001');
    });

    it('should return no data response for non-existent symbol', () => {
      const result = service.getPriceWithResponse('NONEXISTENT');

      expect(result.result).toBe(true);
      expect(result.result_data).toBeNull();
      expect(result.code).toBe('S002');
      expect(result.msg).toContain('NONEXISTENT');
    });
  });

  describe('getAllPrices', () => {
    it('should return empty array when no data exists', () => {
      const result = service.getAllPrices();
      expect(result).toEqual([]);
    });

    it('should return all valid prices', () => {
      const priceData1: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const priceData2: PriceData = {
        symbol: 'ETHUSDT',
        price: '3000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData1);
      service.setPrice(priceData2);

      const result = service.getAllPrices();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(priceData1);
      expect(result).toContainEqual(priceData2);
    });

    it('should filter out expired data', () => {
      const validData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const expiredData: PriceData = {
        symbol: 'ETHUSDT',
        price: '3000.00',
        timestamp: Date.now() - 60000 // 1분 전
      };

      service.setPrice(validData);
      service.setPrice(expiredData);

      const result = service.getAllPrices();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(validData);
    });
  });

  describe('getAllPricesWithResponse', () => {
    it('should return success response with data', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const result = service.getAllPricesWithResponse();

      expect(result.result).toBe(true);
      expect(result.result_data).toHaveLength(1);
      expect(result.result_data[0]).toEqual(priceData);
      expect(result.code).toBe('S001');
    });

    it('should return no data response when no valid data exists', () => {
      const result = service.getAllPricesWithResponse();

      expect(result.result).toBe(true);
      expect(result.result_data).toBeNull();
      expect(result.code).toBe('S002');
      expect(result.msg).toContain('No price data available');
    });
  });

  describe('deletePrice', () => {
    it('should delete existing price data', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const deleted = service.deletePrice('BTCUSDT');
      const retrieved = service.getPrice('BTCUSDT');

      expect(deleted).toBe(true);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent symbol', () => {
      const deleted = service.deletePrice('NONEXISTENT');
      expect(deleted).toBe(false);
    });

    it('should handle case insensitive deletion', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const deleted = service.deletePrice('btcusdt');

      expect(deleted).toBe(true);
    });
  });

  describe('deletePriceWithResponse', () => {
    it('should return success response for successful deletion', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const result = service.deletePriceWithResponse('BTCUSDT');

      expect(result.result).toBe(true);
      expect(result.result_data).toBe(true);
      expect(result.code).toBe('S001');
    });

    it('should return failure response for non-existent symbol', () => {
      const result = service.deletePriceWithResponse('NONEXISTENT');

      expect(result.result).toBe(false);
      expect(result.code).toBe('E001');
    });
  });

  describe('clearAllPrices', () => {
    it('should clear all stored prices', () => {
      const priceData1: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const priceData2: PriceData = {
        symbol: 'ETHUSDT',
        price: '3000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData1);
      service.setPrice(priceData2);

      expect(service.getPriceCount()).toBe(2);

      service.clearAllPrices();

      expect(service.getPriceCount()).toBe(0);
      expect(service.getPrice('BTCUSDT')).toBeNull();
      expect(service.getPrice('ETHUSDT')).toBeNull();
    });
  });

  describe('clearAllPricesWithResponse', () => {
    it('should return success response after clearing', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const result = service.clearAllPricesWithResponse();

      expect(result.result).toBe(true);
      expect(result.result_data).toBe(true);
      expect(result.code).toBe('S001');
    });
  });

  describe('getPriceCount', () => {
    it('should return 0 for empty store', () => {
      expect(service.getPriceCount()).toBe(0);
    });

    it('should return correct count for stored prices', () => {
      const priceData1: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const priceData2: PriceData = {
        symbol: 'ETHUSDT',
        price: '3000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData1);
      expect(service.getPriceCount()).toBe(1);

      service.setPrice(priceData2);
      expect(service.getPriceCount()).toBe(2);
    });

    it('should not count expired data', () => {
      const validData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const expiredData: PriceData = {
        symbol: 'ETHUSDT',
        price: '3000.00',
        timestamp: Date.now() - 60000
      };

      service.setPrice(validData);
      service.setPrice(expiredData);

      // getAllPrices()를 호출하여 만료된 데이터를 정리
      service.getAllPrices();

      expect(service.getPriceCount()).toBe(1);
    });
  });

  describe('getSymbols', () => {
    it('should return empty array for empty store', () => {
      expect(service.getSymbols()).toEqual([]);
    });

    it('should return all stored symbols', () => {
      const priceData1: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      const priceData2: PriceData = {
        symbol: 'ETHUSDT',
        price: '3000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData1);
      service.setPrice(priceData2);

      const symbols = service.getSymbols();
      expect(symbols).toContain('BTCUSDT');
      expect(symbols).toContain('ETHUSDT');
      expect(symbols).toHaveLength(2);
    });
  });

  describe('data validity duration', () => {
    it('should allow setting custom validity duration', () => {
      const customDuration = 60000; // 1분
      service.setDataValidityDuration(customDuration);

      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now() - 30000 // 30초 전
      };

      service.setPrice(priceData);
      const result = service.getPrice('BTCUSDT');

      expect(result).toBeTruthy(); // 1분 유효성 내이므로 데이터 존재
    });

    it('should return current validity duration', () => {
      const customDuration = 45000;
      service.setDataValidityDuration(customDuration);

      expect(service.getDataValidityDuration()).toBe(customDuration);
    });
  });

  describe('getMemoryInfo', () => {
    it('should return correct memory information', () => {
      const priceData: PriceData = {
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: Date.now()
      };

      service.setPrice(priceData);
      const memoryInfo = service.getMemoryInfo();

      expect(memoryInfo.priceCount).toBe(1);
      expect(memoryInfo.symbols).toContain('BTCUSDT');
      expect(memoryInfo.validityDuration).toBeDefined();
      expect(typeof memoryInfo.validityDuration).toBe('number');
    });
  });
}); 