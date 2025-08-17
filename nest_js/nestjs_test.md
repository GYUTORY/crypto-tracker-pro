### NestJS 테스트 실행 가이드 (조용하게 돌리기 포함)

현업 기준으로 깔끔하게 테스트를 돌리는 방법만 정리했다. 핵심은 두 가지다.

- **npm의 `--silent`**: npm 자체 로그만 줄인다.
- **Jest의 `--silent`**: 테스트 코드 안의 `console.log` 같은 출력(표준출력)을 숨긴다.

둘은 대상이 다르다. 둘 다 조용히 하고 싶으면 같이 쓰면 된다.

---

### 1) 바로 쓰는 명령들

- npm 로그만 줄이기

```bash
npm test --silent
# 또는
npm run -s test
# 또는
npm --silent test
```

- Jest 출력(테스트 콘솔 로그) 숨기기

```bash
npm test -- --silent
# 또는
npx jest --silent
```

- 둘 다(최소 소음)

```bash
npm run -s test -- --silent
```

- E2E 테스트에도 동일하게 적용

```bash
npm run -s test:e2e -- --silent
```

- 커버리지, watch 모드도 동일

```bash
npm run -s test:cov -- --silent
npm run -s test:watch -- --silent
```

참고: `--` 뒤의 인자는 npm이 아니라 테스트 러너(Jest)로 전달된다.

---

### 2) 스크립트로 고정해두기

`package.json`에 조용한 스크립트를 하나 추가해두면 편하다.

```json
{
  "scripts": {
    "test": "jest",
    "test:silent": "jest --silent"
  }
}
```

실행:

```bash
npm run -s test:silent
```

---

### 3) 기본값을 조용하게 만들기(선택)

- npm 전역/프로젝트 로그 상시 억제: 프로젝트 루트에 `.npmrc`

```
loglevel=silent
```

- Jest 기본을 조용하게: `package.json`의 `jest` 설정 또는 E2E 전용 설정에 넣기

```json
{
  "jest": {
    "silent": true
  }
}
```

E2E만 조용히 하고 싶으면 `test/jest-e2e.json`에 다음을 추가:

```json
{
  "silent": true
}
```

---

### 4) 더 강하게 조용히(완전 무음에 가깝게)

- 표준출력/표준에러까지 버리기(macOS/Linux)

```bash
npm run -s test -- --silent >/dev/null 2>&1
```

- 로그를 파일로만 남기기

```bash
npm run -s test -- --silent > test.log 2>&1
```

---

### 5) CI에서 자주 쓰는 조합

실패 즉시 중단(`--bail`)과 함께 소음 최소화:

```bash
npm run -s test -- --silent --bail
```

E2E 파이프라인이라면:

```bash
npm run -s test:e2e -- --silent --bail
```

---

### 6) 자주 하는 실수 체크리스트

- `--`를 빼먹으면 Jest 플래그가 npm으로 가지 않아 효과가 없다.
- `--silent`는 테스트 실패 요약까지 없애는 옵션이 아니다. 실패/요약은 기본적으로 출력된다.
- 애플리케이션 런타임 로거(winston 등)에서 나오는 출력은 Jest의 `--silent` 대상이 아니다. 테스트 중 앱 로그까지 막고 싶으면 로거 레벨을 환경변수로 낮추거나, 테스트 환경에서 로거를 목 처리하자.

---

### 7) 이 저장소 기준 빠른 요약

- `package.json`의 `scripts.test`는 `jest`로 설정되어 있으니, 아래 명령이 그대로 통한다.

```bash
# 단위 테스트 최소 소음
npm run -s test -- --silent

# E2E 테스트 최소 소음
npm run -s test:e2e -- --silent

# 커버리지 최소 소음
npm run -s test:cov -- --silent
```

필요하면 `test/jest-e2e.json`에 `"silent": true`를 넣어 E2E 기본값을 조용하게 만들면 된다.



---

### 8) 이 저장소 기준 테스트 전략(유닛/통합/E2E)

- **유닛(Unit)**: DI 덕분에 리포지토리/외부 API를 목으로 갈아끼우고, 유즈케이스/서비스를 빠르게 검증한다.
  - 예: `src/application/use-cases/get-price.use-case.spec.ts`
- **통합(Integration)**: 모듈 단위로 몇몇 실제 구현체를 묶어 상호작용 검증. 외부 네트워크는 여전히 목 처리.
- **E2E**: `AppModule`을 띄우고 HTTP 레벨에서 `supertest`로 요청/응답 계약을 검증.
  - 예: `test/app.e2e-spec.ts`

권장 비율: 유닛 다수, 통합 적당, E2E는 핵심 시나리오 위주(행복/에러 플로우 최소 세트).

---

### 9) TestingModule 패턴(유닛 테스트 핵심)

- **의존성 주입 토큰**: 런타임에 인터페이스가 사라지므로 문자열/심볼/추상 클래스를 주입 토큰으로 사용.
  - 이 저장소에서는 유닛 테스트에서 `'PriceRepository'`, `'BinanceRepository'` 같은 문자열 토큰 사용.
- **프로바이더 등록**: `useValue`로 `jest.Mocked<T>` 형태의 목 객체 주입.
- **오버라이드**: 기존 모듈/프로바이더를 유지하면서 일부 구현만 갈아끼울 때 `overrideProvider` 사용.

예시(유즈케이스 테스트):

```ts
// get-price.use-case.spec.ts 요약 패턴
const mockPriceRepo = { findBySymbol: jest.fn(), save: jest.fn() } as any;
const mockBinanceRepo = { getCurrentPrice: jest.fn() } as any;

const module = await Test.createTestingModule({
  providers: [
    GetPriceUseCase,
    { provide: 'PriceRepository', useValue: mockPriceRepo },
    { provide: 'BinanceRepository', useValue: mockBinanceRepo },
  ],
}).compile();

const useCase = module.get(GetPriceUseCase);
```

예시(컨트롤러 테스트):

```ts
// price.controller.spec.ts 요약 패턴
const mockGetPriceUseCase = { execute: jest.fn() } as any;

const module = await Test.createTestingModule({
  controllers: [PriceController],
  providers: [{ provide: GetPriceUseCase, useValue: mockGetPriceUseCase }],
}).compile();

const controller = module.get(PriceController);
```

팁:
- 입력 정규화(예: 심볼 대문자화)나 캐시 만료 로직처럼 분기 많은 곳부터 유닛 테스트로 커버.
- 저장 시점/출처(`memory`/`api`) 등 도메인 신호를 검증해 회귀 버그를 예방.

---

### 10) E2E 테스트 설정과 패턴

- 설정 파일: `test/jest-e2e.json`
  - `setupFilesAfterEnv`로 `jest-e2e.setup.ts`를 실행하여 전역 타임아웃/콘솔 억제/모킹 초기화.
- 실행 모듈: `AppModule`을 그대로 띄우고 `supertest`로 HTTP 시나리오를 검증.

기본 패턴:

```ts
let app: INestApplication;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = module.createNestApplication();
  await app.init();
});

afterEach(async () => { await app.close(); });

it('GET /price/:symbol', () =>
  request(app.getHttpServer())
    .get('/price/BTCUSDT')
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('result');
      expect(res.body).toHaveProperty('result_data');
    }));
```

프로젝트 특화 시나리오:
- 가격 조회: `/price/:symbol` 정상/잘못된 심볼/케이스 인식/`forceRefresh` 쿼리.
- AI 기술분석: `POST /ai/technical-analysis` 유효/무효 입력.
- TCP 상태: `/tcp/status`, `/tcp/prices`, `/tcp/reconnect` 응답 구조 일관성.

---

### 11) 외부 의존성/네트워크 다루기

- 유닛/통합 테스트에서는 외부 네트워크 호출 금지 권장. 도메인 레이어의 리포지토리 인터페이스를 목킹.
  - 예: `BinanceRepository.getCurrentPrice`를 `jest.fn().mockResolvedValue(...)`로 대체.
- E2E에서도 flaky를 피하고 싶다면, `TestingModule.overrideProvider('BinanceRepository')`로 안정 목 주입.
- 로거 소음은 `jest-e2e.setup.ts`에서 `console.log/error`를 억제해 해결.

---

### 12) 설정/환경 다루기(테스트 안정성)

- 전역 타임아웃: `jest-e2e.setup.ts`에서 `jest.setTimeout(30000)` 적용.
- 환경변수: `process.env.NODE_ENV = 'test'`로 테스트용 분기 처리.
- 필요 시 Config 주입이 있다면 테스트 전용 설정값을 `useValue/useFactory`로 공급.

---

### 13) 속도/안정성 튜닝 팁

- E2E는 보통 `--runInBand`가 안정적이다. 병렬화가 서버 포트 충돌/리소스 경합을 일으킬 수 있다.
- 성능 어설션은 여유를 두고(예: < 5s) 환경 의존성을 낮춘다.
- Fake Timers는 시간 의존 로직(캐시 만료 등)에만 제한적으로 사용.

---

### 14) 실시간/소켓(TCP) 관련 테스트

- 이 프로젝트는 `/tcp/status`, `/tcp/prices`, `/tcp/reconnect`로 관찰 가능한 상태/액션을 노출한다.
- 실시간 소켓 자체를 붙잡아 E2E로 계측하기보다, 노출된 HTTP 계약을 통해
  - 연결 여부/URL/마지막 갱신 시간
  - 메모리 저장 개수/심볼 목록/유효 기간
  을 검증하는 현재 접근이 현실적이고 안정적이다.

---

### 15) 커버리지/품질 관리

- 실행: `npm run -s test:cov -- --silent`
- 임계값(threshold) 예시(원할 경우 `package.json`의 `jest` 설정에 추가):

```json
{
  "jest": {
    "coverageThreshold": {
      "global": { "branches": 70, "functions": 80, "lines": 80, "statements": 80 }
    }
  }
}
```

---

### 16) CI에서 안전한 실행 예시

```bash
# 유닛/통합 최소 소음 + 실패 즉시 중단
npm run -s test -- --silent --bail

# E2E 최소 소음 + 실패 즉시 중단
npm run -s test:e2e -- --silent --bail
```

---

### 17) 디버깅(느린/까다로운 케이스 추적)

- `npm run test:debug` 스크립트로 디버거를 붙여 단일 스펙(runInBand) 추적.
- `jest --runInBand -t "키워드"`로 특정 테스트만 선별 실행.

---

### 18) 자주 하는 실수(보강)

- 목킹 누락: DI 토큰이 실제 구현으로 연결되어 네트워크를 때리는 경우가 있음 → 토큰/프로바이더 확인.
- 컨트롤러 로직 과다: 컨트롤러는 입력 경계만, 핵심은 유즈케이스/서비스 유닛 테스트로 이동.
- 전역 소음: 로거/콘솔 억제는 `setupFilesAfterEnv`에서 처리하고, 테스트 본문에선 출력하지 않기.

---

### 19) 스캐폴드 템플릿(빠른 시작)

```ts
// example.use-case.spec.ts
import { Test } from '@nestjs/testing';

describe('ExampleUseCase', () => {
  it('should work', async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExampleUseCase,
        { provide: 'DepRepo', useValue: { find: jest.fn() } },
      ],
    }).compile();

    const useCase = module.get(ExampleUseCase);
    const res = await useCase.execute({});
    expect(res.result).toBe(true);
  });
});
```

위 템플릿에서 `providers`만 교체해 유즈케이스/서비스 단위 테스트를 빠르게 쌓아올리면 된다.
