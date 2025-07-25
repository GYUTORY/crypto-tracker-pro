import { BaseService } from './base.service';

// BaseService를 상속받는 테스트용 클래스
class TestService extends BaseService {
  public testSuccess<T>(data: T, message?: string, code?: string) {
    return this.success(data, message, code);
  }

  public testFalse<T>(message: string, code?: string, data?: T) {
    return this.false(message, code, data);
  }



  public testFail<T>(message?: string, data?: T) {
    return this.fail(message, data);
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('success', () => {
    it('should create a success response with default values', () => {
      const data = { test: 'data' };
      const result = service.testSuccess(data);

      expect(result).toEqual({
        result: true,
        msg: 'Success',
        result_data: data,
        code: 'S001'
      });
    });

    it('should create a success response with custom message and code', () => {
      const data = { test: 'data' };
      const message = 'Custom success message';
      const code = 'S002';
      const result = service.testSuccess(data, message, code);

      expect(result).toEqual({
        result: true,
        msg: message,
        result_data: data,
        code: code
      });
    });

    it('should handle different data types', () => {
      const stringData = 'test string';
      const numberData = 123;
      const arrayData = [1, 2, 3];
      const nullData = null;

      expect(service.testSuccess(stringData).result_data).toBe(stringData);
      expect(service.testSuccess(numberData).result_data).toBe(numberData);
      expect(service.testSuccess(arrayData).result_data).toBe(arrayData);
      expect(service.testSuccess(nullData).result_data).toBe(nullData);
    });
  });

  describe('false', () => {
    it('should create a failure response with default values', () => {
      const message = 'Error occurred';
      const result = service.testFalse(message);

      expect(result).toEqual({
        result: false,
        msg: message,
        result_data: null,
        code: 'E001'
      });
    });

    it('should create a failure response with custom code and data', () => {
      const message = 'Bad request';
      const code = 'E400';
      const data = { error: 'details' };
      const result = service.testFalse(message, code, data);

      expect(result).toEqual({
        result: false,
        msg: message,
        result_data: data,
        code: code
      });
    });

    it('should handle null data parameter', () => {
      const message = 'Error';
      const result = service.testFalse(message, 'E500', null);

      expect(result.result_data).toBe(null);
    });
  });



  describe('fail', () => {
    it('should create a server error response with default values', () => {
      const result = service.testFail();

      expect(result).toEqual({
        result: false,
        msg: 'Internal server error',
        result_data: null,
        code: 'E500'
      });
    });

    it('should create a server error response with custom message and data', () => {
      const message = 'Database connection failed';
      const data = { error: 'Connection timeout' };
      const result = service.testFail(message, data);

      expect(result).toEqual({
        result: false,
        msg: message,
        result_data: data,
        code: 'E500'
      });
    });

    it('should handle null data parameter', () => {
      const message = 'Server error';
      const result = service.testFail(message, null);

      expect(result.result_data).toBe(null);
    });
  });

  describe('response structure validation', () => {
    it('should always return correct response structure', () => {
      const successResponse = service.testSuccess({ data: 'test' });
      const failureResponse = service.testFalse('Error');
      const failResponse = service.testFail('Server error');

      // Check that all responses have required properties
      [successResponse, failureResponse, failResponse].forEach(response => {
        expect(response).toHaveProperty('result');
        expect(response).toHaveProperty('msg');
        expect(response).toHaveProperty('result_data');
        expect(response).toHaveProperty('code');
        expect(typeof response.result).toBe('boolean');
        expect(typeof response.msg).toBe('string');
        expect(typeof response.code).toBe('string');
      });
    });

    it('should have correct result values', () => {
      expect(service.testSuccess({}).result).toBe(true);
      expect(service.testFalse('Error').result).toBe(false);
      expect(service.testFail().result).toBe(false);
    });
  });
}); 