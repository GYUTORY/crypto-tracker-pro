// E2E 테스트 설정
import 'reflect-metadata';

// 전역 테스트 타임아웃 설정
jest.setTimeout(30000);

// 테스트 환경 설정
process.env.NODE_ENV = 'test';

// 콘솔 로그 억제 (테스트 중 불필요한 로그 제거)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// 테스트 데이터 정리
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
}); 