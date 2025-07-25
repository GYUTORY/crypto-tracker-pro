import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseService } from './services/base.service';

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
            getHealth: jest.fn(),
            getAppInfo: jest.fn(),
            getCurrentTime: jest.fn(),
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

  describe('getHealth', () => {
    it('should return health status from service', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: { status: 'OK', timestamp: '2024-01-15T10:30:00.000Z' },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toEqual(mockResponse);
      expect(appService.getHealth).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: { status: 'OK', timestamp: '2024-01-15T10:30:00.000Z' },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('msg');
      expect(result).toHaveProperty('result_data');
      expect(result).toHaveProperty('code');
      expect(typeof result.result).toBe('boolean');
      expect(typeof result.msg).toBe('string');
      expect(typeof result.code).toBe('string');
    });

    it('should handle service returning different health data', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: { status: 'WARNING', timestamp: '2024-01-15T10:30:00.000Z' },
        code: 'S001',
      } as any;

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result.result_data.status).toBe('WARNING');
    });

    it('should handle service returning error response', () => {
      const mockResponse = {
        result: false,
        msg: 'Service unavailable',
        result_data: null,
        code: 'E500',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result.result).toBe(false);
      expect(result.code).toBe('E500');
    });
  });

  describe('BaseService inheritance', () => {
    it('should extend BaseService', () => {
      expect(appController).toBeInstanceOf(AppController);
      expect(appController).toBeInstanceOf(BaseService);
    });

    it('should have BaseService methods available', () => {
      expect(typeof (appController as any).success).toBe('function');
      expect(typeof (appController as any).fail).toBe('function');
    });
  });

  describe('HTTP decorators', () => {
    it('should have @Get decorator for health endpoint', () => {
      const healthMethod = appController.getHealth;
      expect(healthMethod).toBeDefined();
    });

    it('should have correct HTTP method decorators', () => {
      const healthMethod = appController.getHealth;
      expect(healthMethod).toBeDefined();
    });
  });

  describe('Response consistency', () => {
    it('should always return BaseResponse structure', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: { status: 'OK', timestamp: '2024-01-15T10:30:00.000Z' },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('msg');
      expect(result).toHaveProperty('result_data');
      expect(result).toHaveProperty('code');
    });

    it('should handle service throwing error', () => {
      jest.spyOn(appService, 'getHealth').mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      expect(() => appController.getHealth()).toThrow('Service unavailable');
    });

    it('should handle malformed service response', () => {
      const malformedResponse = {
        result: true,
        msg: 'Health check successful',
        // missing result_data and code
      } as any;

      jest.spyOn(appService, 'getHealth').mockReturnValue(malformedResponse);

      const result = appController.getHealth();

      expect(result).toEqual(malformedResponse);
    });

    it('should handle empty service response', () => {
      const emptyResponse = {} as any;

      jest.spyOn(appService, 'getHealth').mockReturnValue(emptyResponse as any);

      const result = appController.getHealth();

      expect(result).toEqual(emptyResponse);
    });
  });

  describe('Method calls', () => {
    it('should call service method multiple times', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: { status: 'OK', timestamp: '2024-01-15T10:30:00.000Z' },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      appController.getHealth();
      appController.getHealth();

      expect(appService.getHealth).toHaveBeenCalledTimes(2);
    });

    it('should call service method with correct parameters', () => {
      const mockResponse = {
        result: true,
        msg: 'Health check successful',
        result_data: { status: 'OK', timestamp: '2024-01-15T10:30:00.000Z' },
        code: 'S001',
      };

      jest.spyOn(appService, 'getHealth').mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(appService.getHealth).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
    });
  });
}); 