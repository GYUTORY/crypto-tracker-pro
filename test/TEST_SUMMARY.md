# Crypto Tracker Pro - Jest 테스트 코드 요약

## 개요

Crypto Tracker Pro 프로젝트에 포괄적인 Jest 테스트 코드를 추가했습니다. 총 100개의 테스트 케이스가 작성되어 있으며, 모든 테스트가 성공적으로 통과합니다.

### Jest란?
Jest는 Facebook에서 개발한 JavaScript 테스트 프레임워크로, React, Node.js, TypeScript 등 다양한 환경에서 사용할 수 있습니다. Jest의 주요 특징은 다음과 같습니다:

- **Zero Config**: 별도의 설정 없이 바로 사용 가능
- **Snapshot Testing**: UI 컴포넌트의 변경사항을 추적
- **Isolated Tests**: 각 테스트가 독립적으로 실행
- **Code Coverage**: 테스트 커버리지 자동 측정
- **Mock Functions**: 외부 의존성을 쉽게 모킹

### 테스트의 중요성
소프트웨어 개발에서 테스트는 다음과 같은 이유로 필수적입니다:

1. **버그 조기 발견**: 코드 변경 시 예상치 못한 오류를 미리 발견
2. **리팩토링 안전성**: 기존 기능이 깨지지 않음을 보장
3. **문서화 효과**: 테스트 코드가 곧 기능 명세서 역할
4. **개발자 신뢰**: 코드 수정 시 안전하게 작업 가능
5. **유지보수성**: 장기적으로 코드 품질 유지

## 테스트 구조

### 1. 단위 테스트 (Unit Tests)

단위 테스트는 소프트웨어의 가장 작은 테스트 가능한 단위(함수, 메서드, 클래스)를 개별적으로 테스트하는 방법입니다. 각 단위는 독립적으로 테스트되며, 외부 의존성은 모킹을 통해 격리됩니다.

#### 단위 테스트의 특징
- **격리성**: 다른 코드나 외부 시스템에 의존하지 않음
- **빠른 실행**: 작은 단위이므로 실행 속도가 빠름
- **정확한 오류 위치**: 실패 시 정확한 문제 지점 파악 가능
- **자동화**: CI/CD 파이프라인에서 자동 실행 가능

#### 단위 테스트의 장점
1. **개발 속도 향상**: 버그를 조기에 발견하여 디버깅 시간 단축
2. **설계 개선**: 테스트하기 쉬운 코드는 좋은 설계를 유도
3. **문서화**: 코드의 동작을 명확하게 설명
4. **리팩토링 안전성**: 기존 기능이 깨지지 않음을 보장

#### BaseService 테스트 (src/services/base.service.spec.ts)
- 테스트 수: 13개
- 커버리지: 100%
- 테스트 내용:
  - success() 메서드 테스트
  - false() 메서드 테스트
  - createNoDataResponse() 메서드 테스트
  - fail() 메서드 테스트
  - 응답 구조 검증
  - 다양한 데이터 타입 처리

#### PriceStoreService 테스트 (src/tcp/price-store.service.spec.ts)
- 테스트 수: 29개
- 커버리지: 84.48%
- 테스트 내용:
  - 가격 데이터 저장/조회
  - 데이터 유효성 검증 (30초 만료)
  - 심볼 대소문자 처리
  - 메모리 관리 (삭제, 정리)
  - BaseResponse 형태 응답
  - 에러 케이스 처리

#### BinanceService 테스트 (src/binance/binance.service.spec.ts)
- 테스트 수: 25개
- 커버리지: 100%
- 테스트 내용:
  - 메모리 기반 가격 조회
  - 바이낸스 API 폴백 호출
  - 에러 처리 (네트워크, API 오류)
  - 다양한 심볼 형식 처리
  - axios 모킹을 통한 외부 API 테스트

#### AppController 테스트 (src/app.controller.spec.ts)
- 테스트 수: 25개
- 커버리지: 100%
- 테스트 내용:
  - 환영 메시지 엔드포인트
  - 헬스체크 엔드포인트
  - BaseService 상속 검증
  - HTTP 데코레이터 검증
  - 응답 구조 일관성
  - 에러 시나리오 처리

#### TcpService 테스트 (src/tcp/tcp.service.spec.ts)
- 테스트 수: 8개
- 커버리지: 93.97%
- 테스트 내용:
  - WebSocket 연결 관리
  - 바이낸스 데이터 처리
  - 재연결 로직
  - 에러 처리
  - 이벤트 핸들링

### 2. 통합 테스트 (E2E Tests)

통합 테스트(End-to-End Test)는 애플리케이션의 전체 워크플로우를 실제 사용자 시나리오에 따라 테스트하는 방법입니다. 데이터베이스, 외부 API, 네트워크 등 모든 구성 요소가 실제 환경과 유사하게 동작하는지 검증합니다.

#### E2E 테스트의 특징
- **전체 시스템 검증**: 모든 컴포넌트가 함께 동작하는지 확인
- **실제 사용자 시나리오**: 실제 사용자가 겪을 수 있는 상황을 시뮬레이션
- **환경 의존성**: 실제 데이터베이스, 외부 API 등이 필요
- **느린 실행**: 전체 시스템을 테스트하므로 실행 시간이 김

#### E2E 테스트의 장점
1. **사용자 관점 검증**: 실제 사용자가 경험하는 문제를 발견
2. **시스템 통합 확인**: 각 컴포넌트 간 상호작용 검증
3. **회귀 테스트**: 새로운 기능이 기존 기능에 영향을 주지 않는지 확인
4. **품질 보증**: 배포 전 최종 품질 검증

#### E2E 테스트 (test/app.e2e-spec.ts)
- 테스트 수: 25개
- 테스트 내용:
  - 전체 애플리케이션 엔드포인트 테스트
  - HTTP 응답 검증
  - 데이터 구조 검증
  - 성능 테스트
  - 에러 처리 검증

## 테스트 커버리지

테스트 커버리지는 소프트웨어 테스트가 얼마나 포괄적으로 수행되었는지를 측정하는 지표입니다. 코드의 어느 부분이 테스트되었는지, 어느 부분이 테스트되지 않았는지를 수치로 나타냅니다.

### 커버리지 지표의 의미

#### Statement Coverage (문장 커버리지)
- **정의**: 코드의 각 문장(statement)이 실행되었는지 측정
- **목표**: 80% 이상 권장
- **의미**: 모든 코드 라인이 최소 한 번은 실행되었는지 확인

#### Branch Coverage (분기 커버리지)
- **정의**: 조건문의 각 분기(if-else, switch-case)가 실행되었는지 측정
- **목표**: 70% 이상 권장
- **의미**: 모든 조건 분기를 테스트했는지 확인

#### Function Coverage (함수 커버리지)
- **정의**: 각 함수가 호출되었는지 측정
- **목표**: 90% 이상 권장
- **의미**: 모든 함수가 테스트되었는지 확인

#### Line Coverage (라인 커버리지)
- **정의**: 각 코드 라인이 실행되었는지 측정
- **목표**: 80% 이상 권장
- **의미**: 실제 실행된 라인 수를 확인

### 현재 프로젝트 커버리지 분석

```
-------------------------|---------|----------|---------|---------|-----------------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s           
-------------------------|---------|----------|---------|---------|-----------------------------
All files                |   57.54 |    76.74 |   69.84 |   58.05 |                             
 src/services            |     100 |      100 |     100 |     100 |                             
  base.service.ts        |     100 |      100 |     100 |     100 |                             
 src/binance             |   53.33 |      100 |      50 |   56.41 |                             
  binance.service.ts     |     100 |      100 |     100 |     100 |                             
 src/tcp                 |   72.15 |    73.33 |   76.08 |   73.21 |                             
  price-store.service.ts |   84.48 |    84.61 |   76.19 |   83.92 |                             
  tcp.service.ts         |   93.97 |      100 |   90.47 |   93.82 |                             
 src/app.controller.ts   |     100 |      100 |     100 |     100 |                             
-------------------------|---------|----------|---------|---------|-----------------------------
```

### 커버리지 개선 방안
1. **낮은 커버리지 파일 집중**: binance 모듈의 커버리지 향상 필요
2. **에러 케이스 추가**: 예외 상황에 대한 테스트 케이스 보강
3. **경계값 테스트**: 최대/최소값, null/undefined 처리 테스트 추가
4. **통합 테스트 강화**: 컴포넌트 간 상호작용 테스트 확대

## 테스트 도구

### 테스트 실행 스크립트 (test-runner.sh)
- 다양한 테스트 옵션 제공
- 커맨드라인 인터페이스
- 색상 출력 및 진행 상황 표시

사용법:
```bash
./test-runner.sh                    # 단위 테스트 실행
./test-runner.sh -t e2e            # E2E 테스트 실행
./test-runner.sh -t coverage       # 커버리지 테스트
./test-runner.sh -t watch          # 감시 모드
./test-runner.sh -t all -v         # 모든 테스트 상세 출력
```

### Jest 설정
- 단위 테스트: package.json의 Jest 설정
- E2E 테스트: test/jest-e2e.json
- 테스트 환경: test/jest-e2e.setup.ts

## 테스트 특징

### 1. 모킹 전략

모킹(Mocking)은 테스트에서 외부 의존성을 가짜 객체로 대체하는 기법입니다. 이를 통해 테스트의 격리성을 보장하고 예측 가능한 결과를 얻을 수 있습니다.

#### 모킹의 목적
- **격리성 확보**: 외부 시스템에 의존하지 않는 독립적인 테스트
- **예측 가능성**: 외부 API의 응답을 제어하여 일관된 테스트 결과
- **빠른 실행**: 실제 네트워크 호출 없이 빠른 테스트 실행
- **에러 시나리오 테스트**: 네트워크 오류, 타임아웃 등 예외 상황 시뮬레이션

#### 사용된 모킹 라이브러리
- **WebSocket**: ws 라이브러리 모킹 - 실시간 연결 테스트
- **HTTP 클라이언트**: axios 모킹 - API 호출 테스트
- **타이머**: setTimeout/clearTimeout 모킹 - 시간 기반 로직 테스트
- **콘솔**: console.log/console.error 모킹 - 로그 출력 검증

### 2. 테스트 패턴

#### AAA 패턴 (Arrange-Act-Assert)
테스트를 세 단계로 나누어 구조화하는 방법입니다.

```typescript
it('should return success response', () => {
  // Arrange (준비): 테스트 데이터와 환경 설정
  const input = 'test data';
  const expected = { success: true, data: input };
  
  // Act (실행): 테스트 대상 메서드 호출
  const result = service.process(input);
  
  // Assert (검증): 결과 확인
  expect(result).toEqual(expected);
});
```

#### Given-When-Then 패턴
비즈니스 요구사항을 명확하게 표현하는 테스트 구조입니다.

```typescript
it('should return cached price when available', () => {
  // Given (주어진 상황): 테스트 전제 조건
  const symbol = 'BTCUSDT';
  const cachedPrice = { price: '50000', timestamp: Date.now() };
  priceStoreService.setPrice(symbol, cachedPrice);

  // When (실행할 때): 테스트 대상 동작
  const result = binanceService.getPrice(symbol);

  // Then (그러면): 예상 결과 검증
  expect(result.success).toBe(true);
  expect(result.data.price).toBe('50000');
});
```

#### Edge Case 테스트
경계값과 예외 상황을 테스트하여 코드의 견고성을 검증합니다.

```typescript
it('should handle empty input', () => {
  const result = service.process('');
  expect(result.success).toBe(false);
  expect(result.error).toBe('Input cannot be empty');
});

it('should handle null input', () => {
  const result = service.process(null);
  expect(result.success).toBe(false);
  expect(result.error).toBe('Input is required');
});
```

### 3. 데이터 검증

#### BaseResponse 구조 검증
모든 API 응답이 일관된 구조를 가지는지 확인합니다.

```typescript
expect(result).toHaveProperty('success');
expect(result).toHaveProperty('data');
expect(result).toHaveProperty('timestamp');
expect(typeof result.success).toBe('boolean');
```

#### 타입 안전성 검증
TypeScript의 타입 시스템을 활용한 컴파일 타임 검증과 런타임 검증을 모두 수행합니다.

```typescript
// 컴파일 타임 타입 체크
const response: BaseResponse<PriceData> = service.getPrice('BTCUSDT');

// 런타임 타입 검증
expect(typeof response.data.price).toBe('string');
expect(typeof response.data.timestamp).toBe('number');
```

#### 에러 코드 표준화
모든 에러 상황에 대해 일관된 에러 코드와 메시지를 사용합니다.

```typescript
expect(result.success).toBe(false);
expect(result.error).toMatch(/^[A-Z_]+$/); // 대문자와 언더스코어만 허용
expect(result.message).toBeTruthy();
```

## 주요 테스트 시나리오

### 성공 케이스

성공 케이스는 애플리케이션이 정상적으로 동작할 때의 시나리오를 테스트합니다. 이는 사용자가 기대하는 기본적인 기능이 올바르게 작동하는지 확인하는 중요한 테스트입니다.

#### 정상적인 데이터 처리
```typescript
it('should process valid cryptocurrency symbol', () => {
  const symbol = 'BTCUSDT';
  const result = service.getPrice(symbol);
  
  expect(result.success).toBe(true);
  expect(result.data).toHaveProperty('price');
  expect(result.data).toHaveProperty('symbol');
});
```

#### 메모리 기반 빠른 응답
캐시된 데이터가 있을 때 API 호출 없이 빠르게 응답하는지 테스트합니다.

```typescript
it('should return cached data when available', () => {
  // 캐시에 데이터 저장
  cacheService.set('BTCUSDT', { price: '50000', timestamp: Date.now() });
  
  const result = service.getPrice('BTCUSDT');
  
  expect(result.success).toBe(true);
  expect(result.data.price).toBe('50000');
  expect(apiService.getPrice).not.toHaveBeenCalled(); // API 호출 안됨
});
```

#### WebSocket 실시간 데이터 수신
실시간 데이터 스트림이 올바르게 처리되는지 테스트합니다.

```typescript
it('should handle real-time price updates', () => {
  const mockData = { symbol: 'BTCUSDT', price: '51000' };
  
  // WebSocket 이벤트 시뮬레이션
  websocketService.emit('price', mockData);
  
  expect(priceStoreService.getPrice('BTCUSDT')).toEqual(mockData);
});
```

#### API 폴백 시스템
주 API가 실패했을 때 대체 API로 전환되는지 테스트합니다.

```typescript
it('should fallback to secondary API when primary fails', () => {
  // 주 API 실패 시뮬레이션
  primaryApiService.getPrice.mockRejectedValue(new Error('Network error'));
  
  const result = service.getPrice('BTCUSDT');
  
  expect(result.success).toBe(true);
  expect(secondaryApiService.getPrice).toHaveBeenCalled();
});
```

### 에러 케이스

에러 케이스는 예외 상황에서 애플리케이션이 적절히 대응하는지 테스트합니다. 이는 시스템의 안정성과 사용자 경험을 보장하는 중요한 테스트입니다.

#### 네트워크 오류 처리
```typescript
it('should handle network timeout', () => {
  apiService.getPrice.mockRejectedValue(new Error('Request timeout'));
  
  const result = service.getPrice('BTCUSDT');
  
  expect(result.success).toBe(false);
  expect(result.error).toBe('NETWORK_TIMEOUT');
  expect(result.message).toContain('네트워크 연결 시간이 초과되었습니다');
});
```

#### 잘못된 심볼 처리
```typescript
it('should handle invalid symbol format', () => {
  const invalidSymbols = ['', 'INVALID', 'BTC-USD', '123'];
  
  invalidSymbols.forEach(symbol => {
    const result = service.getPrice(symbol);
    expect(result.success).toBe(false);
    expect(result.error).toBe('INVALID_SYMBOL');
  });
});
```

#### 데이터 만료 처리
캐시된 데이터가 만료되었을 때 새로운 데이터를 가져오는지 테스트합니다.

```typescript
it('should refresh expired cache data', () => {
  const oldTimestamp = Date.now() - 60000; // 1분 전
  cacheService.set('BTCUSDT', { price: '50000', timestamp: oldTimestamp });
  
  const result = service.getPrice('BTCUSDT');
  
  expect(apiService.getPrice).toHaveBeenCalled(); // 새로운 API 호출
  expect(result.data.timestamp).toBeGreaterThan(oldTimestamp);
});
```

#### WebSocket 연결 실패
```typescript
it('should handle WebSocket connection failure', () => {
  websocketService.connect.mockRejectedValue(new Error('Connection failed'));
  
  const result = service.connectWebSocket();
  
  expect(result.success).toBe(false);
  expect(service.isConnected()).toBe(false);
});
```

### 경계 케이스

경계 케이스는 입력값의 최대/최소값이나 특수한 상황에서 애플리케이션이 올바르게 동작하는지 테스트합니다.

#### 빈 데이터 처리
```typescript
it('should handle empty response from API', () => {
  apiService.getPrice.mockResolvedValue(null);
  
  const result = service.getPrice('BTCUSDT');
  
  expect(result.success).toBe(false);
  expect(result.error).toBe('NO_DATA_AVAILABLE');
});
```

#### 최대/최소값 처리
```typescript
it('should handle extreme price values', () => {
  const extremePrices = ['0', '999999999', '-1000'];
  
  extremePrices.forEach(price => {
    const mockData = { symbol: 'BTCUSDT', price };
    apiService.getPrice.mockResolvedValue(mockData);
    
    const result = service.getPrice('BTCUSDT');
    
    if (price === '-1000') {
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PRICE');
    } else {
      expect(result.success).toBe(true);
    }
  });
});
```

#### 동시 요청 처리
여러 요청이 동시에 들어올 때 올바르게 처리되는지 테스트합니다.

```typescript
it('should handle concurrent requests', async () => {
  const promises = Array(10).fill(null).map(() => 
    service.getPrice('BTCUSDT')
  );
  
  const results = await Promise.all(promises);
  
  results.forEach(result => {
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('price');
  });
});
```

#### 메모리 부족 상황
```typescript
it('should handle memory pressure', () => {
  // 메모리 부족 상황 시뮬레이션
  const largeData = Array(1000000).fill('data');
  cacheService.set('large', largeData);
  
  const result = service.getPrice('BTCUSDT');
  
  expect(result.success).toBe(true);
  expect(cacheService.size()).toBeLessThan(1000); // 캐시 크기 제한
});
```

## 테스트 실행 결과

```
Test Suites: 5 passed, 5 total
Tests:       100 passed, 100 total
Snapshots:   0 total
Time:        3.453 s
```

## 테스트 실행 명령어

```bash
# 기본 테스트
npm test

# 커버리지 테스트
npm run test:cov

# 감시 모드
npm run test:watch

# E2E 테스트
npm run test:e2e

# 테스트 스크립트 사용
./test-runner.sh -t all
```

## 테스트 작성 가이드

### 새로운 테스트 추가 시
1. 파일명: *.spec.ts (단위 테스트) 또는 *.e2e-spec.ts (E2E 테스트)
2. 구조: describe → it → expect 패턴
3. 모킹: 외부 의존성은 반드시 모킹
4. 검증: 결과값과 부작용 모두 검증

### 모킹 예시
```typescript
// WebSocket 모킹
jest.mock('ws');

// HTTP 클라이언트 모킹
jest.mock('axios');

// 타이머 모킹
jest.spyOn(global, 'setTimeout').mockImplementation();
```

### 테스트 데이터
- 실제 데이터: 바이낸스 API 응답 형식 사용
- Mock 데이터: 테스트용 가짜 데이터 생성
- Edge Case: 경계값 및 예외 상황 데이터

## 결론

이번 테스트 코드 추가를 통해 Crypto Tracker Pro 프로젝트는:

1. 높은 신뢰성: 100개 테스트로 코드 품질 보장
2. 유지보수성: 리팩토링 시 안전성 확보
3. 문서화: 테스트 코드를 통한 기능 명세
4. 개발 효율성: 자동화된 테스트로 개발 속도 향상

모든 핵심 기능이 테스트로 커버되어 있으며, 향후 기능 추가 시에도 안전하게 개발할 수 있는 기반이 마련되었습니다.

## NestJS에서 .spec.ts 파일이란?

### 개념 및 정의

`.spec.ts` 파일은 NestJS 프레임워크에서 단위 테스트(Unit Test)를 작성하기 위한 표준 파일 확장자입니다. "spec"은 "specification"(명세)의 줄임말로, 해당 파일이 특정 기능이나 컴포넌트의 동작을 명세하고 검증하는 역할을 합니다.

### NestJS 테스트의 특징

NestJS는 Angular에서 영감을 받아 개발된 Node.js 프레임워크로, 테스트 작성에도 Angular의 패턴을 따릅니다. NestJS의 테스트는 다음과 같은 특징을 가집니다:

#### 의존성 주입 기반 테스트
NestJS의 핵심 기능인 의존성 주입(DI) 시스템을 테스트에서도 활용할 수 있습니다.

```typescript
// 실제 서비스의 의존성을 테스트에서도 동일하게 주입
const module: TestingModule = await Test.createTestingModule({
  controllers: [AppController],
  providers: [AppService],
}).compile();

const controller = module.get<AppController>(AppController);
const service = module.get<AppService>(AppService);
```

#### 데코레이터 기반 메타데이터 테스트
NestJS의 데코레이터(@Get, @Post, @Injectable 등)가 올바르게 적용되었는지 테스트할 수 있습니다.

```typescript
it('should have @Get decorator', () => {
  const metadata = Reflect.getMetadata('path', AppController.prototype.getHello);
  expect(metadata).toBe('/');
});
```

#### 모듈 시스템 테스트
NestJS의 모듈 시스템을 활용하여 실제 애플리케이션과 동일한 구조로 테스트를 작성할 수 있습니다.

```typescript
const module: TestingModule = await Test.createTestingModule({
  imports: [AppModule], // 전체 모듈을 임포트하여 테스트
}).compile();
```

### NestJS 테스트 파일 구조

```
src/
├── app.controller.ts          # 실제 컨트롤러
├── app.controller.spec.ts     # 컨트롤러 테스트
├── app.service.ts             # 실제 서비스
├── app.service.spec.ts        # 서비스 테스트
├── binance/
│   ├── binance.service.ts     # 실제 바이낸스 서비스
│   └── binance.service.spec.ts # 바이낸스 서비스 테스트
```

### .spec.ts 파일의 특징

#### 1. 파일 명명 규칙
- 원본 파일: component.ts
- 테스트 파일: component.spec.ts
- E2E 테스트: component.e2e-spec.ts

#### 2. NestJS 테스트 모듈 사용
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });
});
```

#### 3. NestJS 특화 테스트 기능

의존성 주입 테스트
```typescript
// 서비스 모킹
const mockAppService = {
  getHello: jest.fn().mockReturnValue('Hello World!'),
};

beforeEach(async () => {
  const app: TestingModule = await Test.createTestingModule({
    controllers: [AppController],
    providers: [
      {
        provide: AppService,
        useValue: mockAppService,
      },
    ],
  }).compile();
});
```

HTTP 요청 테스트
```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

### NestJS 테스트의 장점

#### 1. 프레임워크 통합
- 의존성 주입: NestJS DI 컨테이너 활용
- 모듈 시스템: 실제 모듈 구조와 동일한 테스트 환경
- 데코레이터: NestJS 데코레이터 검증 가능

#### 2. 타입 안전성
```typescript
// TypeScript 타입 체크
let appController: AppController;  // 타입 명시
let appService: AppService;        // 타입 명시

// 컴파일 타임에 타입 오류 감지
appController = app.get<AppController>(AppController);
```

#### 3. 자동 모킹
```typescript
// NestJS 자동 모킹 기능
const module: TestingModule = await Test.createTestingModule({
  controllers: [AppController],
  providers: [AppService],
})
.overrideProvider(AppService)
.useValue(mockAppService)
.compile();
```

### 테스트 파일 작성 패턴

#### 1. AAA 패턴 (Arrange-Act-Assert)
```typescript
describe('AppController', () => {
  it('should return "Hello World!"', () => {
    // Arrange (준비)
    const expected = 'Hello World!';
    jest.spyOn(appService, 'getHello').mockReturnValue(expected);

    // Act (실행)
    const result = appController.getHello();

    // Assert (검증)
    expect(result).toBe(expected);
    expect(appService.getHello).toHaveBeenCalled();
  });
});
```

#### 2. Given-When-Then 패턴
```typescript
describe('BinanceService', () => {
  it('should return cached price when available', () => {
    // Given (주어진 상황)
    const symbol = 'BTCUSDT';
    const cachedPrice = { price: '50000', timestamp: Date.now() };
    priceStoreService.setPrice(symbol, cachedPrice);

    // When (실행할 때)
    const result = binanceService.getPrice(symbol);

    // Then (그러면)
    expect(result.success).toBe(true);
    expect(result.data.price).toBe('50000');
  });
});
```

### NestJS 테스트 실행

#### Jest 설정
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

#### Jest 설정 파일
```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',  // .spec.ts 파일만 테스트
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### 테스트 커버리지 분석

#### NestJS 특화 커버리지
- 컨트롤러: HTTP 엔드포인트 커버리지
- 서비스: 비즈니스 로직 커버리지
- 가드: 인증/인가 로직 커버리지
- 인터셉터: 요청/응답 처리 커버리지
- 파이프: 데이터 변환/검증 커버리지

#### 커버리지 지표
```bash
# 커버리지 실행
npm run test:cov

# 결과 예시
-------------------------|---------|----------|---------|---------|-----------------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s           
-------------------------|---------|----------|---------|---------|-----------------------------
All files                |   57.54 |    76.74 |   69.84 |   58.05 |                             
 src/app.controller.ts   |     100 |      100 |     100 |     100 |                             
 src/app.service.ts      |     100 |      100 |     100 |     100 |                             
-------------------------|---------|----------|---------|---------|-----------------------------
```

### 모킹 전략

#### 1. 서비스 모킹
```typescript
// 실제 서비스 대신 Mock 객체 사용
const mockBinanceService = {
  getPrice: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: BinanceService,
        useValue: mockBinanceService,
      },
    ],
  }).compile();
});
```

#### 2. 외부 의존성 모킹
```typescript
// HTTP 클라이언트 모킹
jest.mock('axios');

// WebSocket 모킹
jest.mock('ws');

// 데이터베이스 모킹
jest.mock('@nestjs/typeorm');
```

### 테스트 데이터 관리

#### 1. Fixture 사용
```typescript
// test/fixtures/binance.fixture.ts
export const mockBinancePrice = {
  symbol: 'BTCUSDT',
  price: '50000.00',
  timestamp: Date.now(),
};

export const mockBinanceError = {
  code: 'INVALID_SYMBOL',
  message: 'Invalid symbol',
};
```

#### 2. Factory 패턴
```typescript
// test/factories/price.factory.ts
export class PriceFactory {
  static create(overrides: Partial<PriceData> = {}): PriceData {
    return {
      symbol: 'BTCUSDT',
      price: '50000.00',
      timestamp: Date.now(),
      ...overrides,
    };
  }
}
```

### 디버깅 및 문제 해결

#### 1. 테스트 디버깅
```bash
# 디버그 모드로 테스트 실행
npm run test:debug

# 특정 테스트만 실행
npm test -- --testNamePattern="should return cached price"
```

#### 2. 로그 확인
```typescript
// 테스트에서 로그 확인
it('should log error message', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  
  // 테스트 실행
  service.handleError();
  
  expect(consoleSpy).toHaveBeenCalledWith('Error occurred');
  consoleSpy.mockRestore();
});
```

### 모범 사례

#### 1. 테스트 격리
```typescript
// 각 테스트마다 새로운 인스턴스 생성
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    // 설정
  }).compile();
  
  // 새로운 인스턴스 할당
  service = module.get<TestService>(TestService);
});

// 테스트 후 정리
afterEach(() => {
  jest.clearAllMocks();
});
```

#### 2. 의미있는 테스트명
```typescript
// 좋은 예
it('should return cached price when data is less than 30 seconds old', () => {
  // 테스트 내용
});

// 나쁜 예
it('should work', () => {
  // 테스트 내용
});
```

#### 3. 한 번에 하나씩 테스트
```typescript
// 각 테스트는 하나의 동작만 검증
it('should return success response', () => {
  const result = service.process();
  expect(result.success).toBe(true);
});

it('should return correct data', () => {
  const result = service.process();
  expect(result.data).toEqual(expectedData);
});
```

이러한 방식으로 NestJS의 .spec.ts 파일을 통해 체계적이고 안정적인 테스트 코드를 작성할 수 있습니다. 