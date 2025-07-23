import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return welcome message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(res.body.code).toBe('S001');
        });
    });

    it('should return correct response structure', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.result).toBe('boolean');
          expect(typeof res.body.msg).toBe('string');
          expect(typeof res.body.code).toBe('string');
          expect(res.body.result_data).toBeDefined();
        });
    });
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(res.body.code).toBe('S001');
          expect(res.body.result_data).toHaveProperty('status');
          expect(res.body.result_data).toHaveProperty('timestamp');
        });
    });

    it('should return valid timestamp', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const timestamp = res.body.result_data.timestamp;
          expect(new Date(timestamp).getTime()).not.toBeNaN();
        });
    });
  });

  describe('GET /tcp/status', () => {
    it('should return WebSocket connection status', () => {
      return request(app.getHttpServer())
        .get('/tcp/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(res.body.code).toBe('S001');
          expect(res.body.result_data).toHaveProperty('connection');
          expect(res.body.result_data).toHaveProperty('memory');
          expect(res.body.result_data).toHaveProperty('timestamp');
        });
    });

    it('should return connection information', () => {
      return request(app.getHttpServer())
        .get('/tcp/status')
        .expect(200)
        .expect((res) => {
          const connection = res.body.result_data.connection;
          expect(connection).toHaveProperty('isConnected');
          expect(connection).toHaveProperty('url');
          expect(connection).toHaveProperty('lastUpdate');
          expect(typeof connection.isConnected).toBe('boolean');
          expect(typeof connection.url).toBe('string');
          expect(typeof connection.lastUpdate).toBe('string');
        });
    });

    it('should return memory information', () => {
      return request(app.getHttpServer())
        .get('/tcp/status')
        .expect(200)
        .expect((res) => {
          const memory = res.body.result_data.memory;
          expect(memory).toHaveProperty('priceCount');
          expect(memory).toHaveProperty('symbols');
          expect(memory).toHaveProperty('validityDuration');
          expect(typeof memory.priceCount).toBe('number');
          expect(Array.isArray(memory.symbols)).toBe(true);
          expect(typeof memory.validityDuration).toBe('number');
        });
    });
  });

  describe('GET /tcp/prices', () => {
    it('should return all stored prices', () => {
      return request(app.getHttpServer())
        .get('/tcp/prices')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(Array.isArray(res.body.result_data)).toBe(true);
        });
    });

    it('should return empty array when no prices stored', () => {
      return request(app.getHttpServer())
        .get('/tcp/prices')
        .expect(200)
        .expect((res) => {
          expect(res.body.result_data).toEqual([]);
          expect(res.body.code).toBe('S002');
        });
    });
  });

  describe('GET /binance/price/:symbol', () => {
    it('should return price for valid symbol', () => {
      return request(app.getHttpServer())
        .get('/binance/price/BTCUSDT')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(res.body.result_data).toHaveProperty('symbol');
          expect(res.body.result_data).toHaveProperty('price');
          expect(res.body.result_data.symbol).toBe('BTCUSDT');
          expect(typeof res.body.result_data.price).toBe('string');
        });
    });

    it('should handle invalid symbol', () => {
      return request(app.getHttpServer())
        .get('/binance/price/INVALID')
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(false);
          expect(res.body.code).toBe('E400');
          expect(res.body.msg).toContain('Invalid symbol');
        });
    });

    it('should handle empty symbol', () => {
      return request(app.getHttpServer())
        .get('/binance/price/')
        .expect(404);
    });

    it('should handle case insensitive symbol', () => {
      return request(app.getHttpServer())
        .get('/binance/price/btcusdt')
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(true);
          expect(res.body.result_data.symbol).toBe('BTCUSDT');
        });
    });

    it('should return price for ETHUSDT', () => {
      return request(app.getHttpServer())
        .get('/binance/price/ETHUSDT')
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(true);
          expect(res.body.result_data.symbol).toBe('ETHUSDT');
          expect(typeof res.body.result_data.price).toBe('string');
        });
    });
  });

  describe('GET /tcp/reconnect', () => {
    it('should attempt reconnection', () => {
      return request(app.getHttpServer())
        .get('/tcp/reconnect')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(res.body.code).toBe('S001');
        });
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent endpoint', () => {
      return request(app.getHttpServer())
        .get('/non-existent')
        .expect(404);
    });

    it('should handle malformed requests', () => {
      return request(app.getHttpServer())
        .post('/')
        .expect(404);
    });

    it('should handle invalid HTTP methods', () => {
      return request(app.getHttpServer())
        .put('/health')
        .expect(404);
    });
  });

  describe('Response consistency', () => {
    it('should always return BaseResponse structure', () => {
      const endpoints = ['/', '/health', '/tcp/status', '/tcp/prices'];
      
      return Promise.all(
        endpoints.map(endpoint =>
          request(app.getHttpServer())
            .get(endpoint)
            .expect(200)
            .expect((res) => {
              expect(res.body).toHaveProperty('result');
              expect(res.body).toHaveProperty('msg');
              expect(res.body).toHaveProperty('result_data');
              expect(res.body).toHaveProperty('code');
              expect(typeof res.body.result).toBe('boolean');
              expect(typeof res.body.msg).toBe('string');
              expect(typeof res.body.code).toBe('string');
            })
        )
      );
    });

    it('should return correct HTTP status codes', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });

  describe('Performance', () => {
    it('should respond quickly to health check', () => {
      const startTime = Date.now();
      
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(() => {
          const endTime = Date.now();
          expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
        });
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/health')
          .expect(200)
      );

      await Promise.all(requests);
    });
  });

  describe('Data validation', () => {
    it('should validate price data structure', () => {
      return request(app.getHttpServer())
        .get('/binance/price/BTCUSDT')
        .expect(200)
        .expect((res) => {
          if (res.body.result) {
            const priceData = res.body.result_data;
            expect(priceData).toHaveProperty('symbol');
            expect(priceData).toHaveProperty('price');
            expect(typeof priceData.symbol).toBe('string');
            expect(typeof priceData.price).toBe('string');
            expect(priceData.symbol.length).toBeGreaterThan(0);
            expect(priceData.price.length).toBeGreaterThan(0);
          }
        });
    });

    it('should validate timestamp format', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const timestamp = res.body.result_data.timestamp;
          expect(typeof timestamp).toBe('string');
          expect(new Date(timestamp).toISOString()).toBe(timestamp);
        });
    });
  });
}); 