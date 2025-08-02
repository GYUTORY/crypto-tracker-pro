import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Crypto Tracker Pro (e2e)', () => {
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

  describe('GET /price/:symbol', () => {
    it('should return price for valid symbol', () => {
      return request(app.getHttpServer())
        .get('/price/BTCUSDT')
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
        .get('/price/INVALID')
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(false);
          expect(res.body.code).toBe('E500');
          expect(res.body.msg).toContain('INVALID 가격 조회 실패');
        });
    });

    it('should handle case insensitive symbol', () => {
      return request(app.getHttpServer())
        .get('/price/btcusdt')
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(true);
          expect(res.body.result_data.symbol).toBe('BTCUSDT');
        });
    });

    it('should handle forceRefresh parameter', () => {
      return request(app.getHttpServer())
        .get('/price/BTCUSDT?forceRefresh=true')
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(true);
          expect(res.body.result_data).toHaveProperty('source');
        });
    });
  });

  describe('POST /ai/technical-analysis', () => {
    it('should return technical analysis for valid symbol', () => {
      return request(app.getHttpServer())
        .post('/ai/technical-analysis')
        .send({ symbol: 'BTCUSDT' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result');
          expect(res.body).toHaveProperty('msg');
          expect(res.body).toHaveProperty('result_data');
          expect(res.body).toHaveProperty('code');
          expect(res.body.result).toBe(true);
          expect(res.body.result_data).toHaveProperty('symbol');
          expect(res.body.result_data).toHaveProperty('price');
          expect(res.body.result_data).toHaveProperty('analysis');
        });
    });

    it('should handle invalid symbol', () => {
      return request(app.getHttpServer())
        .post('/ai/technical-analysis')
        .send({ symbol: 'INVALID' })
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(false);
          expect(res.body.code).toBe('E500');
        });
    });

    it('should handle missing symbol', () => {
      return request(app.getHttpServer())
        .post('/ai/technical-analysis')
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.result).toBe(false);
          expect(res.body.code).toBe('E500');
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
          expect(res.body.code).toBe('E500');
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
          expect(res.body.result_data).toHaveProperty('prices');
          expect(res.body.result_data).toHaveProperty('count');
          expect(res.body.result_data).toHaveProperty('symbols');
          expect(res.body.result_data).toHaveProperty('timestamp');
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
        .post('/price/BTCUSDT')
        .expect(404);
    });

    it('should handle invalid HTTP methods', () => {
      return request(app.getHttpServer())
        .put('/price/BTCUSDT')
        .expect(404);
    });
  });

  describe('Response consistency', () => {
    it('should always return BaseResponse structure', () => {
      const endpoints = [
        { method: 'get', path: '/price/BTCUSDT' },
        { method: 'post', path: '/ai/technical-analysis', body: { symbol: 'BTCUSDT' } },
        { method: 'get', path: '/binance/price/BTCUSDT' },
        { method: 'get', path: '/tcp/status' },
        { method: 'get', path: '/tcp/prices' }
      ];
      
      return Promise.all(
        endpoints.map(endpoint => {
          const req = request(app.getHttpServer())[endpoint.method](endpoint.path);
          if (endpoint.body) {
            req.send(endpoint.body);
          }
          return req
            .expect(200)
            .expect((res) => {
              expect(res.body).toHaveProperty('result');
              expect(res.body).toHaveProperty('msg');
              expect(res.body).toHaveProperty('result_data');
              expect(res.body).toHaveProperty('code');
              expect(typeof res.body.result).toBe('boolean');
              expect(typeof res.body.msg).toBe('string');
              expect(typeof res.body.code).toBe('string');
            });
        })
      );
    });
  });

  describe('Performance', () => {
    it('should respond quickly to price requests', () => {
      const startTime = Date.now();
      
      return request(app.getHttpServer())
        .get('/price/BTCUSDT')
        .expect(200)
        .expect(() => {
          const endTime = Date.now();
          expect(endTime - startTime).toBeLessThan(5000); // 5초 이내
        });
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/price/BTCUSDT')
          .expect(200)
      );

      await Promise.all(requests);
    });
  });

  describe('Data validation', () => {
    it('should validate price data structure', () => {
      return request(app.getHttpServer())
        .get('/price/BTCUSDT')
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

    it('should validate technical analysis structure', () => {
      return request(app.getHttpServer())
        .post('/ai/technical-analysis')
        .send({ symbol: 'BTCUSDT' })
        .expect(200)
        .expect((res) => {
          if (res.body.result) {
            const analysisData = res.body.result_data;
            expect(analysisData).toHaveProperty('symbol');
            expect(analysisData).toHaveProperty('price');
            expect(analysisData).toHaveProperty('analysis');
            expect(analysisData.analysis).toHaveProperty('rsi');
            expect(analysisData.analysis).toHaveProperty('macd');
            expect(analysisData.analysis).toHaveProperty('bollinger');
            expect(analysisData.analysis).toHaveProperty('movingAverages');
            expect(analysisData.analysis).toHaveProperty('overallSignal');
            expect(analysisData.analysis).toHaveProperty('confidence');
            expect(analysisData.analysis).toHaveProperty('simpleAdvice');
            expect(analysisData.analysis).toHaveProperty('riskLevel');
            expect(analysisData.analysis).toHaveProperty('riskExplanation');
          }
        });
    });
  });
}); 