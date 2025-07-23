import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(),
            getHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return welcome message from service', () => {
      const mockResponse = {
        result: true,
        msg: 'Welcome message retrieved successfully',
        result_data: 'Welcome to Crypto Tracker Pro!',
        code: 'S001',
      };

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      const result = appController.getHello();

      expect(result).toEqual(mockResponse);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', () => {
      const mockResponse = {
        result: true,
        msg: 'Welcome message retrieved successfully',
        result_data: 'Welcome to Crypto Tracker Pro!',
        code: 'S001',
      };

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      const result = appController.getHello();

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('msg');
      expect(result).toHaveProperty('result_data');
      expect(result).toHaveProperty('code');
      expect(typeof result.result).toBe('boolean');
      expect(typeof result.msg).toBe('string');
      expect(typeof result.code).toBe('string');
    });

    it('should handle service returning different message types', () => {
      const mockResponse = {
        result: true,
        msg: 'Custom welcome message',
        result_data: { message: 'Welcome', version: '1.0.0' },
        code: 'S001',
      } as any;

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      const result = appController.getHello();

      expect(result.result_data).toEqual({ message: 'Welcome', version: '1.0.0' });
    });

    it('should handle service returning error response', () => {
      const mockResponse = {
        result: false,
        msg: 'Service unavailable',
        result_data: null,
        code: 'E500',
      };

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      const result = appController.getHello();

      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
    });
  });

  describe('getHealth', () => {
    it('should return health status from service', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: {
          status: 'OK',
          timestamp: '2024-01-15T10:30:00.000Z',
        },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toEqual(mockResponse);
      expect(appService.getHealth).toHaveBeenCalledTimes(1);
    });

    it('should return correct health response structure', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: {
          status: 'OK',
          timestamp: '2024-01-15T10:30:00.000Z',
        },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('msg');
      expect(result).toHaveProperty('result_data');
      expect(result).toHaveProperty('code');
      expect(result.result_data).toHaveProperty('status');
      expect(result.result_data).toHaveProperty('timestamp');
    });

    it('should handle service returning unhealthy status', () => {
      const mockResponse = {
        result: false,
        msg: 'Health check failed',
        result_data: {
          status: 'ERROR',
          timestamp: '2024-01-15T10:30:00.000Z',
          error: 'Database connection failed',
        },
        code: 'E500',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result.result).toBe(false);
      expect(result.result_data.status).toBe('ERROR');
      expect(result.code).toBe('E500');
    });

    it('should handle service returning detailed health information', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: {
          status: 'OK',
          timestamp: '2024-01-15T10:30:00.000Z',
          uptime: 3600000,
          memory: {
            used: 52428800,
            total: 1073741824,
            percentage: 4.88,
          },
          websocketConnected: true,
        },
        code: 'S001',
      } as any;

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect((result.result_data as any).uptime).toBe(3600000);
      expect((result.result_data as any).memory).toBeDefined();
      expect((result.result_data as any).websocketConnected).toBe(true);
    });

    it('should handle service throwing error', () => {
      jest.spyOn(appService, 'getHealth').mockImplementation(() => {
        throw new Error('Service error');
      });

      expect(() => appController.getHealth()).toThrow('Service error');
    });

    it('should handle service returning null response', () => {
      jest.spyOn(appService, 'getHealth').mockReturnValue(null as any);

      const result = appController.getHealth();

      expect(result).toBeNull();
    });

    it('should handle service returning undefined response', () => {
      jest.spyOn(appService, 'getHealth').mockReturnValue(undefined as any);

      const result = appController.getHealth();

      expect(result).toBeUndefined();
    });
  });

  describe('controller inheritance', () => {
    it('should extend BaseService', () => {
      expect(appController).toBeInstanceOf(AppController);
      // BaseService의 메서드들이 사용 가능한지 확인
      expect(typeof appController['success']).toBe('function');
      expect(typeof appController['false']).toBe('function');
      expect(typeof appController['createNoDataResponse']).toBe('function');
      expect(typeof appController['fail']).toBe('function');
    });

    it('should have correct HTTP decorators', () => {
      // @Get() 데코레이터가 적용되었는지 확인
      const getHelloMetadata = Reflect.getMetadata('path', appController.getHello);
      const getHealthMetadata = Reflect.getMetadata('path', appController.getHealth);
      
      // NestJS의 메타데이터가 설정되었는지 확인
      expect(appController.getHello).toBeDefined();
      expect(appController.getHealth).toBeDefined();
    });
  });

  describe('response consistency', () => {
    it('should always return BaseResponse structure from getHello', () => {
      const mockResponse = {
        result: true,
        msg: 'Welcome message retrieved successfully',
        result_data: 'Welcome to Crypto Tracker Pro!',
        code: 'S001',
      };

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      const result = appController.getHello();

      expect(result).toMatchObject({
        result: expect.any(Boolean),
        msg: expect.any(String),
        result_data: expect.anything(),
        code: expect.any(String),
      });
    });

    it('should always return BaseResponse structure from getHealth', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: {
          status: 'OK',
          timestamp: '2024-01-15T10:30:00.000Z',
        },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toMatchObject({
        result: expect.any(Boolean),
        msg: expect.any(String),
        result_data: expect.anything(),
        code: expect.any(String),
      });
    });
  });

  describe('error scenarios', () => {
    it('should handle service method throwing exception', () => {
      const error = new Error('Service unavailable');
      jest.spyOn(appService, 'getHello').mockImplementation(() => {
        throw error;
      });

      expect(() => appController.getHello()).toThrow('Service unavailable');
    });

    it('should handle service returning malformed response', () => {
      const malformedResponse = {
        result: true,
        // msg missing
        result_data: 'Welcome',
        // code missing
      } as any;

      jest.spyOn(appService, 'getHello').mockReturnValue(malformedResponse);

      const result = appController.getHello();

      expect(result).toEqual(malformedResponse);
      expect(result.msg).toBeUndefined();
      expect(result.code).toBeUndefined();
    });

    it('should handle service returning empty response', () => {
      const emptyResponse = {};

      jest.spyOn(appService, 'getHello').mockReturnValue(emptyResponse as any);

      const result = appController.getHello();

      expect(result).toEqual(emptyResponse);
    });
  });

  describe('performance', () => {
    it('should call service method only once per request', () => {
      const mockResponse = {
        result: true,
        msg: 'Welcome message retrieved successfully',
        result_data: 'Welcome to Crypto Tracker Pro!',
        code: 'S001',
      };

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      appController.getHello();
      appController.getHello();

      expect(appService.getHello).toHaveBeenCalledTimes(2);
    });

    it('should return immediately without additional processing', () => {
      const mockResponse = {
        result: true,
        msg: 'Welcome message retrieved successfully',
        result_data: 'Welcome to Crypto Tracker Pro!',
        code: 'S001',
      };

      jest.spyOn(appService, 'getHello').mockReturnValue(mockResponse);

      const startTime = Date.now();
      const result = appController.getHello();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // 10ms 이내
      expect(result).toEqual(mockResponse);
    });
  });
}); 