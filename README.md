# Crypto Tracker Pro

실시간 암호화폐 가격 추적 API 서버입니다. 바이낸스 WebSocket과 REST API를 활용해 실시간 가격 데이터를 제공하고, Google Gemini AI로 기술적 분석을 수행합니다.

## 주요 기능

- **실시간 가격 조회**: 바이낸스 WebSocket + REST API 폴백
- **메모리 캐시**: 빠른 응답을 위한 인메모리 캐싱
- **AI 분석**: Google Gemini를 활용한 기술적 분석
- **Clean Architecture**: 확장 가능한 모듈 구조

## 기술 스택

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **WebSocket**: ws
- **HTTP Client**: axios
- **AI**: Google Generative AI
- **Documentation**: Swagger/OpenAPI

## 프로젝트 구조

```
src/
├── domain/                    # 도메인 엔티티 & 인터페이스
│   ├── entities/
│   │   ├── price.entity.ts
│   │   └── technical-analysis.entity.ts
│   └── repositories/
│       ├── price-repository.interface.ts
│       ├── binance-repository.interface.ts
│       └── ai-repository.interface.ts
├── application/              # 비즈니스 로직 (Use Cases)
│   ├── use-cases/
│   │   ├── get-price.use-case.ts
│   │   └── analyze-technical.use-case.ts
│   └── application.module.ts
├── infrastructure/           # 외부 시스템 연동
│   ├── repositories/
│   │   ├── memory-price.repository.ts
│   │   ├── binance-api.repository.ts
│   │   └── google-ai.repository.ts
│   └── infrastructure.module.ts
├── presentation/             # HTTP API (Controllers)
│   ├── controllers/
│   │   ├── price.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── binance.controller.ts
│   │   └── tcp.controller.ts
│   └── presentation.module.ts
├── shared/                   # 공통 유틸리티
│   ├── base-response.ts
│   ├── logger.ts
│   └── dto/
└── config/                   # 설정 관리
    ├── config.module.ts
    └── config.service.ts
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일 생성:
```env
PORT=3000
NODE_ENV=development

# 바이낸스 API
BINANCE_BASE_URL=https://api.binance.com
BINANCE_WS_URL=wss://stream.binance.com:9443/ws

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key
GOOGLE_AI_MODEL=gemini-1.5-pro

# 로깅
LOG_LEVEL=info
```

### 3. 개발 서버 실행
```bash
npm run start:dev
```

### 4. 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## API 사용법

### 가격 조회
```bash
# 기본 조회 (캐시 우선)
GET /price/BTCUSDT

# 강제 새로고침
GET /price/BTCUSDT?forceRefresh=true
```

### AI 기술적 분석
```bash
GET /ai/technical-analysis/BTCUSDT
```

### WebSocket 상태 확인
```bash
GET /tcp/status
GET /tcp/prices
```

### 응답 형식
```json
{
  "result": true,
  "msg": "메모리에서 BTCUSDT 가격 조회 완료",
  "result_data": {
    "symbol": "BTCUSDT",
    "price": "43250.50",
    "source": "memory",
    "age": 5000
  },
  "code": "S001"
}
```

## 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 커버리지 확인
npm run test:cov
```

## API 문서

서버 실행 후 `http://localhost:3000/api-docs`에서 Swagger 문서를 확인할 수 있습니다.

## Clean Architecture

이 프로젝트는 Clean Architecture 패턴을 적용했습니다. 비즈니스 로직과 외부 의존성을 분리하여 유지보수성과 테스트 용이성을 높였습니다.

### 레이어 구조

```
Presentation → Application → Domain ← Infrastructure
```

#### Domain Layer (도메인 계층)
- **Entities**: `Price`, `TechnicalAnalysis` - 핵심 비즈니스 객체
- **Repository Interfaces**: 데이터 접근 추상화
- **특징**: 외부 의존성 없음, 순수한 비즈니스 로직

```typescript
// Price 엔티티 - 도메인 규칙 포함
export class Price {
  constructor(
    private readonly _symbol: string,
    private readonly _price: string,
    private readonly _timestamp: number
  ) {
    this.validate(); // 도메인 규칙 검증
  }

  isExpired(validityDuration: number): boolean {
    return Date.now() - this._timestamp > validityDuration;
  }
}
```

#### Application Layer (애플리케이션 계층)
- **Use Cases**: 비즈니스 로직 캡슐화
- **특징**: 단일 책임, 의존성 주입으로 외부 시스템과 분리

```typescript
@Injectable()
export class GetPriceUseCase extends BaseService {
  constructor(
    @Inject('PriceRepository') private readonly priceRepository: PriceRepository,
    @Inject('BinanceRepository') private readonly binanceRepository: BinanceRepository
  ) { super(); }

  async execute(request: GetPriceRequest): Promise<BaseResponse<GetPriceResponse>> {
    // 비즈니스 로직: 캐시 확인 → API 호출 → 저장
  }
}
```

#### Infrastructure Layer (인프라스트럭처 계층)
- **Repository Implementations**: 실제 데이터 접근 구현
- **External Services**: 바이낸스 API, Google AI 연동
- **특징**: 도메인 인터페이스 구현, 외부 시스템과의 실제 통신

```typescript
@Injectable()
export class BinanceApiRepository implements BinanceRepository {
  async getCurrentPrice(symbol: string): Promise<Price> {
    // 실제 바이낸스 API 호출
  }
}
```

#### Presentation Layer (프레젠테이션 계층)
- **Controllers**: HTTP 요청 처리
- **DTOs**: 요청/응답 데이터 변환
- **특징**: 비즈니스 로직 없음, Use Case 호출만 담당

### 의존성 역전 원칙

도메인 계층이 외부 시스템에 의존하지 않고, 인터페이스를 통해 추상화합니다.

```typescript
// 도메인에 인터페이스 정의
interface PriceRepository {
  save(price: Price): Promise<void>;
  findBySymbol(symbol: string): Promise<Price | null>;
}

// 인프라스트럭처에서 구현
class MemoryPriceRepository implements PriceRepository {
  // 실제 구현
}
```

### 실제 데이터 흐름

```
1. HTTP 요청 → PriceController
2. Controller → GetPriceUseCase.execute()
3. UseCase → PriceRepository.findBySymbol() (인터페이스)
4. Repository → MemoryPriceRepository.findBySymbol() (구현체)
5. UseCase → BinanceRepository.getCurrentPrice() (폴백)
6. UseCase → PriceRepository.save() (캐시 저장)
7. Controller → HTTP 응답
```

### Clean Architecture의 장점

#### 1. 테스트 용이성
- 각 계층을 독립적으로 테스트 가능
- Mock 객체로 외부 의존성 격리
- 비즈니스 로직을 외부 시스템 없이 테스트

```typescript
// UseCase 테스트 - 실제 API 호출 없음
describe('GetPriceUseCase', () => {
  it('should return cached price when available', async () => {
    const mockPriceRepository = {
      findBySymbol: jest.fn().mockResolvedValue(mockPrice)
    };
    // 테스트 로직...
  });
});
```

#### 2. 유지보수성
- 비즈니스 로직 변경 시 도메인 계층만 수정
- 외부 시스템 변경 시 인프라스트럭처 계층만 수정
- 새로운 기능 추가 시 기존 코드 영향 최소화

#### 3. 확장성
- 새로운 저장소 구현체 추가 용이
- 새로운 AI 서비스 추가 시 인터페이스만 구현
- 기술 스택 변경 시 도메인 로직 영향 없음

### 실제 적용 사례

#### 캐시 전략 변경
메모리 캐시를 Redis로 변경할 때:
1. `RedisPriceRepository` 구현체 생성
2. DI 설정만 변경
3. 도메인 로직은 전혀 수정 불필요

#### AI 서비스 변경
Google AI를 OpenAI로 변경할 때:
1. `OpenAiRepository` 구현체 생성
2. 인터페이스 구현
3. 비즈니스 로직은 그대로 유지

### 캐시 전략
1. 메모리에서 먼저 조회
2. 만료된 경우 API 호출
3. 백그라운드에서 자동 갱신

### 에러 처리
- 계층별 에러 처리
- 표준화된 응답 형식
- 로깅 및 모니터링

## 개발 가이드

### 새로운 Use Case 추가
1. `src/application/use-cases/`에 새 Use Case 클래스 생성
2. `src/application/application.module.ts`에 등록
3. `src/presentation/controllers/`에 Controller 추가

### 새로운 Repository 추가
1. `src/domain/repositories/`에 인터페이스 정의
2. `src/infrastructure/repositories/`에 구현체 생성
3. `src/infrastructure/infrastructure.module.ts`에 등록

### 테스트 작성
- Use Case: 비즈니스 로직 테스트
- Controller: HTTP 요청/응답 테스트
- Repository: 데이터 접근 테스트

## 성능 최적화

- **메모리 캐시**: 30초 TTL
- **백그라운드 갱신**: 사용자 응답 차단 없음
- **WebSocket 연결**: 실시간 데이터 스트리밍
- **에러 재시도**: 자동 재연결 메커니즘

## 모니터링

- Winston 로깅
- WebSocket 연결 상태
- API 응답 시간
- 에러율 추적

## 배포

### Docker (권장)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### 환경별 설정
- `config/development.json`
- `config/production.json`
- `config/test.json`

## 라이선스

MIT License 