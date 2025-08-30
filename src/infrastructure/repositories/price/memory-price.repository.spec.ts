import { Test, TestingModule } from '@nestjs/testing';
import { MemoryPriceRepository } from './memory-price.repository';
import { Price } from '../../domain/entities/price.entity';

describe('MemoryPriceRepository', () => {
  let repository: MemoryPriceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryPriceRepository],
    }).compile();

    repository = module.get<MemoryPriceRepository>(MemoryPriceRepository);
  });

  describe('findBySymbol', () => {
    it('should return null when no price exists for symbol', async () => {
      // Act
      const result = await repository.findBySymbol('BTCUSDT');

      // Assert
      expect(result).toBeNull();
    });

    it('should return price when exists and not expired', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const price = new Price(symbol, '50000', Date.now());
      await repository.save(price);

      // Act
      const result = await repository.findBySymbol(symbol);

      // Assert
      expect(result).toBeDefined();
      expect(result?.symbol).toBe(symbol);
      expect(result?.price).toBe('50000');
    });

    it('should return expired price (expiration check is done in UseCase)', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const expiredPrice = new Price(symbol, '50000', Date.now() - 60000); // 1분 전
      await repository.save(expiredPrice);

      // Act
      const result = await repository.findBySymbol(symbol);

      // Assert
      expect(result).toBeDefined();
      expect(result?.symbol).toBe(symbol);
      expect(result?.isExpired(30000)).toBe(true); // 30초 유효기간으로 만료 확인
    });

    it('should handle case insensitive symbol lookup', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const price = new Price(symbol, '50000', Date.now());
      await repository.save(price);

      // Act
      const result = await repository.findBySymbol('btcusdt');

      // Assert
      expect(result).toBeDefined();
      expect(result?.symbol).toBe(symbol);
    });
  });

  describe('save', () => {
    it('should save price successfully', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const price = new Price(symbol, '50000', Date.now());

      // Act
      await repository.save(price);

      // Assert
      const savedPrice = await repository.findBySymbol(symbol);
      expect(savedPrice).toBeDefined();
      expect(savedPrice?.symbol).toBe(symbol);
      expect(savedPrice?.price).toBe('50000');
    });

    it('should update existing price', async () => {
      // Arrange
      const symbol = 'BTCUSDT';
      const oldPrice = new Price(symbol, '50000', Date.now());
      const newPrice = new Price(symbol, '51000', Date.now());

      await repository.save(oldPrice);

      // Act
      await repository.save(newPrice);

      // Assert
      const savedPrice = await repository.findBySymbol(symbol);
      expect(savedPrice?.price).toBe('51000');
    });

    it('should handle multiple symbols', async () => {
      // Arrange
      const btcPrice = new Price('BTCUSDT', '50000', Date.now());
      const ethPrice = new Price('ETHUSDT', '3000', Date.now());

      // Act
      await repository.save(btcPrice);
      await repository.save(ethPrice);

      // Assert
      const savedBtc = await repository.findBySymbol('BTCUSDT');
      const savedEth = await repository.findBySymbol('ETHUSDT');
      
      expect(savedBtc?.symbol).toBe('BTCUSDT');
      expect(savedEth?.symbol).toBe('ETHUSDT');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no prices exist', async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return all prices', async () => {
      // Arrange
      const btcPrice = new Price('BTCUSDT', '50000', Date.now());
      const ethPrice = new Price('ETHUSDT', '3000', Date.now());

      await repository.save(btcPrice);
      await repository.save(ethPrice);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(p => p.symbol)).toContain('BTCUSDT');
      expect(result.map(p => p.symbol)).toContain('ETHUSDT');
    });
  });

  describe('clearAll', () => {
    it('should clear all prices', async () => {
      // Arrange
      const btcPrice = new Price('BTCUSDT', '50000', Date.now());
      const ethPrice = new Price('ETHUSDT', '3000', Date.now());

      await repository.save(btcPrice);
      await repository.save(ethPrice);

      // Act
      await repository.clearAll();

      // Assert
      const allPrices = await repository.findAll();
      expect(allPrices).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return correct count', async () => {
      // Arrange
      const btcPrice = new Price('BTCUSDT', '50000', Date.now());
      const ethPrice = new Price('ETHUSDT', '3000', Date.now());

      await repository.save(btcPrice);
      await repository.save(ethPrice);

      // Act
      const count = await repository.count();

      // Assert
      expect(count).toBe(2);
    });

    it('should return zero when no prices exist', async () => {
      // Act
      const count = await repository.count();

      // Assert
      expect(count).toBe(0);
    });
  });

  describe('getSymbols', () => {
    it('should return all symbols', async () => {
      // Arrange
      const btcPrice = new Price('BTCUSDT', '50000', Date.now());
      const ethPrice = new Price('ETHUSDT', '3000', Date.now());

      await repository.save(btcPrice);
      await repository.save(ethPrice);

      // Act
      const symbols = await repository.getSymbols();

      // Assert
      expect(symbols).toContain('BTCUSDT');
      expect(symbols).toContain('ETHUSDT');
      expect(symbols).toHaveLength(2);
    });

    it('should return empty array when no prices exist', async () => {
      // Act
      const symbols = await repository.getSymbols();

      // Assert
      expect(symbols).toEqual([]);
    });
  });

  describe('deleteBySymbol', () => {
    it('should delete price by symbol', async () => {
      // Arrange
      const btcPrice = new Price('BTCUSDT', '50000', Date.now());
      const ethPrice = new Price('ETHUSDT', '3000', Date.now());

      await repository.save(btcPrice);
      await repository.save(ethPrice);

      // Act
      const deleted = await repository.deleteBySymbol('BTCUSDT');

      // Assert
      expect(deleted).toBe(true);
      const remainingPrices = await repository.findAll();
      expect(remainingPrices).toHaveLength(1);
      expect(remainingPrices[0].symbol).toBe('ETHUSDT');
    });

    it('should return false when symbol does not exist', async () => {
      // Act
      const deleted = await repository.deleteBySymbol('NONEXISTENT');

      // Assert
      expect(deleted).toBe(false);
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired prices', async () => {
      // Arrange
      const validPrice = new Price('BTCUSDT', '50000', Date.now());
      const expiredPrice = new Price('ETHUSDT', '3000', Date.now() - 60000);

      await repository.save(validPrice);
      await repository.save(expiredPrice);

      // Act
      await repository.deleteExpired(30000); // 30초

      // Assert
      const remainingPrices = await repository.findAll();
      expect(remainingPrices).toHaveLength(1);
      expect(remainingPrices[0].symbol).toBe('BTCUSDT');
    });
  });
}); 