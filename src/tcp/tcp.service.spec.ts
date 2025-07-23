import { Test, TestingModule } from '@nestjs/testing';
import { TcpService } from './tcp.service';
import { PriceStoreService } from './price-store.service';
import * as WebSocket from 'ws';

// WebSocket 모킹
jest.mock('ws');

describe('TcpService', () => {
  let service: TcpService;
  let priceStoreService: PriceStoreService;
  let mockWebSocket: any;

  beforeEach(async () => {
    // WebSocket 모킹 설정
    mockWebSocket = {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      pong: jest.fn(),
      readyState: WebSocket.OPEN,
    };

    (WebSocket as jest.MockedClass<typeof WebSocket>).mockImplementation(() => mockWebSocket);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TcpService,
        {
          provide: PriceStoreService,
          useValue: {
            setPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TcpService>(TcpService);
    priceStoreService = module.get<PriceStoreService>(PriceStoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('onModuleInit', () => {
    it('should connect to Binance WebSocket on module init', async () => {
      // WebSocket 연결 성공 시뮬레이션
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'open') {
          callback();
        }
      });

      await service.onModuleInit();

      expect(WebSocket).toHaveBeenCalledWith('wss://stream.binance.com:9443/ws');
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: [
            'btcusdt@ticker',
            'ethusdt@ticker',
            'btcusdt@trade',
            'ethusdt@trade'
          ],
          id: 1
        })
      );
    });

    it('should handle WebSocket connection error', async () => {
      const error = new Error('Connection failed');
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
      });

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect WebSocket on module destroy', async () => {
      // WebSocket 연결 상태 설정
      (service as any).ws = mockWebSocket;
      
      await service.onModuleDestroy();

      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('should clear reconnect timer on module destroy', async () => {
      // 타이머 모킹
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      // 재연결 타이머 설정
      (service as any).reconnectTimer = 123;

      await service.onModuleDestroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('handleBinanceData', () => {
    it('should process ticker data correctly', () => {
      const tickerData = {
        stream: 'btcusdt@ticker',
        data: {
          s: 'BTCUSDT',
          c: '50000.00',
          v: '1000.50',
          P: '2.5'
        }
      };

      const messageData = Buffer.from(JSON.stringify(tickerData));

      // WebSocket 메시지 이벤트 시뮬레이션
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(messageData);
        }
      });

      // 서비스 초기화 시 메시지 핸들러 등록
      service['connectToBinance']();

      expect(priceStoreService.setPrice).toHaveBeenCalledWith({
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: expect.any(Number),
        volume: '1000.50',
        changePercent24h: '2.5'
      });
    });

    it('should process trade data correctly', () => {
      const tradeData = {
        stream: 'btcusdt@trade',
        data: {
          s: 'BTCUSDT',
          p: '50000.00',
          q: '0.1',
          T: 1705312200000
        }
      };

      const messageData = Buffer.from(JSON.stringify(tradeData));

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(messageData);
        }
      });

      service['connectToBinance']();

      // trade 데이터는 ticker가 아니므로 setPrice가 호출되지 않음
      expect(priceStoreService.setPrice).not.toHaveBeenCalled();
    });

    it('should ignore subscription confirmation messages', () => {
      const subscriptionData = {
        result: ['btcusdt@ticker'],
        id: 1
      };

      const messageData = Buffer.from(JSON.stringify(subscriptionData));

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(messageData);
        }
      });

      service['connectToBinance']();

      expect(priceStoreService.setPrice).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON data', () => {
      const malformedData = Buffer.from('invalid json');

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(malformedData);
        }
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service['connectToBinance']();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error processing Binance data:',
        expect.any(Error)
      );
    });

    it('should handle empty message data', () => {
      const emptyData = Buffer.from('');

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(emptyData);
        }
      });

      service['connectToBinance']();

      expect(priceStoreService.setPrice).not.toHaveBeenCalled();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return correct connection status', () => {
      const status = service.getConnectionStatus();

      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('url');
      expect(status).toHaveProperty('lastUpdate');
      expect(status.url).toBe('wss://stream.binance.com:9443/ws');
      expect(typeof status.lastUpdate).toBe('string');
    });

    it('should return connection status with response', () => {
      const response = service.getConnectionStatusWithResponse();

      expect(response.result).toBe(true);
      expect(response.result_data).toHaveProperty('isConnected');
      expect(response.result_data).toHaveProperty('url');
      expect(response.result_data).toHaveProperty('lastUpdate');
      expect(response.code).toBe('S001');
    });
  });

  describe('reconnect', () => {
    it('should attempt manual reconnection', async () => {
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'open') {
          callback();
        }
      });

      // WebSocket 연결 상태 설정
      (service as any).ws = mockWebSocket;

      await service.reconnect();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(WebSocket).toHaveBeenCalledTimes(1); // 재연결만 호출됨
    });

    it('should return reconnection response', async () => {
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'open') {
          callback();
        }
      });

      const response = await service.reconnectWithResponse();

      expect(response.result).toBe(true);
      expect(response.result_data).toBe(true);
      expect(response.code).toBe('S001');
    });

    it('should handle reconnection failure', async () => {
      const error = new Error('Reconnection failed');
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
      });

      const response = await service.reconnectWithResponse();

      expect(response.result).toBe(false);
      expect(response.code).toBe('E500');
    });
  });

  describe('WebSocket event handling', () => {
    it('should handle connection close event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation();

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback();
        }
      });

      service['connectToBinance']();

      expect(consoleSpy).toHaveBeenCalledWith('Connection to Binance WebSocket stream closed');
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should handle ping event', () => {
      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'ping') {
          callback();
        }
      });

      service['connectToBinance']();

      expect(mockWebSocket.pong).toHaveBeenCalled();
    });

    it('should handle connection error event', () => {
      const error = new Error('Connection error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
      });

      expect(() => service['connectToBinance']()).rejects.toThrow('Connection error');
      expect(consoleSpy).toHaveBeenCalledWith('Binance WebSocket connection error:', error.message);
    });
  });

  describe('data processing edge cases', () => {
    it('should handle missing stream property', () => {
      const dataWithoutStream = {
        data: {
          s: 'BTCUSDT',
          c: '50000.00'
        }
      };

      const messageData = Buffer.from(JSON.stringify(dataWithoutStream));

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(messageData);
        }
      });

      service['connectToBinance']();

      expect(priceStoreService.setPrice).not.toHaveBeenCalled();
    });

    it('should handle missing data property', () => {
      const dataWithoutData = {
        stream: 'btcusdt@ticker'
      };

      const messageData = Buffer.from(JSON.stringify(dataWithoutData));

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(messageData);
        }
      });

      service['connectToBinance']();

      expect(priceStoreService.setPrice).not.toHaveBeenCalled();
    });

    it('should handle ticker data with missing fields', () => {
      const incompleteTickerData = {
        stream: 'btcusdt@ticker',
        data: {
          s: 'BTCUSDT',
          c: '50000.00'
          // volume, changePercent24h missing
        }
      };

      const messageData = Buffer.from(JSON.stringify(incompleteTickerData));

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(messageData);
        }
      });

      service['connectToBinance']();

      expect(priceStoreService.setPrice).toHaveBeenCalledWith({
        symbol: 'BTCUSDT',
        price: '50000.00',
        timestamp: expect.any(Number),
        volume: undefined,
        changePercent24h: undefined
      });
    });
  });

  describe('reconnection scheduling', () => {
    it('should schedule reconnection after connection close', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation();

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback();
        }
      });

      service['connectToBinance']();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should clear existing reconnect timer before scheduling new one', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockReturnValue(123 as any);

      // 재연결 타이머 설정
      (service as any).reconnectTimer = 123;

      mockWebSocket.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback();
        }
      });

      service['connectToBinance']();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });
  });
}); 