# Crypto Tracker Pro

실시간 암호화폐 가격 추적 API 서버입니다. 바이낸스 WebSocket과 REST API를 활용해 실시간 가격 데이터를 제공하고, Google Gemini로 기술적 분석을 수행합니다.

## 주요 기능

- **실시간 가격 조회**: 바이낸스 WebSocket + REST API 폴백
- **메모리 캐시**: 빠른 응답을 위한 인메모리 캐싱
- **기술적 분석**: Google Gemini를 활용한 시장 분석
- **모듈화 구조**: 확장 가능한 코드 구조

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
├── domain/                    # 핵심 비즈니스 로직
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

### 기술적 분석
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

## 코드 구조

이 프로젝트는 계층화된 구조를 사용했습니다. 각 계층의 역할을 명확히 나누고 의존성 방향을 일관되게 유지해서 코드를 관리하기 쉽게 만들었습니다.

### 계층 구조

```
Presentation → Application → Domain ← Infrastructure
```

### 실제 동작 과정

사용자가 `GET /price/BTCUSDT` 요청을 보낼 때 어떤 일이 일어나는지 살펴보겠습니다.

```
1. HTTP 요청 → PriceController.getPrice()
   ↓
2. Controller → GetPriceUseCase.execute(request)
   ↓
3. UseCase → PriceRepository.findBySymbol() (인터페이스 호출)
   ↓
4. Repository → MemoryPriceRepository.findBySymbol() (실제 구현)
   ↓
5. UseCase → BinanceRepository.getCurrentPrice() (캐시 미스 시)
   ↓
6. UseCase → PriceRepository.save() (새로운 가격 캐시)
   ↓
7. UseCase → Controller (응답 반환)
   ↓
8. Controller → HTTP 응답 (JSON)
```

### 각 계층의 역할

#### 1. Presentation Layer (프레젠테이션 계층)
**위치**: `src/presentation/`

사용자(클라이언트)와 직접 소통하는 부분입니다. HTTP 요청을 받아서 적절한 Use Case를 호출하고 결과를 반환합니다.

**주요 역할**:
- 비즈니스 로직은 전혀 없음
- 요청을 받아서 응답으로 바꾸는 것만 담당
- 에러 처리와 로깅

**코드 예시**:
```typescript
// src/presentation/controllers/price.controller.ts
@Controller('price')
export class PriceController {
  constructor(
    private readonly getPriceUseCase: GetPriceUseCase,
    private readonly analyzeTechnicalUseCase: AnalyzeTechnicalUseCase
  ) {}

  @Get(':symbol')
  async getPrice(
    @Param('symbol') symbol: string,
    @Query('forceRefresh') forceRefresh?: string
  ): Promise<BaseResponse<GetPriceResponse>> {
    const request: GetPriceRequest = {
      symbol: symbol.toUpperCase(),
      forceRefresh: forceRefresh === 'true'
    };

    return await this.getPriceUseCase.execute(request);
  }

  @Get(':symbol/technical-analysis')
  async getTechnicalAnalysis(
    @Param('symbol') symbol: string
  ): Promise<BaseResponse<TechnicalAnalysisResponse>> {
    const request: AnalyzeTechnicalRequest = {
      symbol: symbol.toUpperCase()
    };

    return await this.analyzeTechnicalUseCase.execute(request);
  }
}
```

#### 2. Application Layer (애플리케이션 계층)
**위치**: `src/application/`

실제 비즈니스 로직이 들어가는 곳입니다. 각 Use Case는 하나의 비즈니스 작업을 처리합니다.

**주요 역할**:
- 하나의 Use Case가 하나의 비즈니스 작업만 담당
- 외부 시스템과는 느슨하게 연결
- 비즈니스 작업의 원자성 보장

**코드 예시**:
```typescript
// src/application/use-cases/get-price.use-case.ts
@Injectable()
export class GetPriceUseCase extends BaseService {
  constructor(
    @Inject('PriceRepository') private readonly priceRepository: PriceRepository,
    @Inject('BinanceRepository') private readonly binanceRepository: BinanceRepository
  ) { 
    super(); 
  }

  async execute(request: GetPriceRequest): Promise<BaseResponse<GetPriceResponse>> {
    try {
      // 1. 캐시에서 먼저 조회
      let price = await this.priceRepository.findBySymbol(request.symbol);
      
      // 2. 캐시가 없거나 만료된 경우 API 호출
      if (!price || price.isExpired(30000) || request.forceRefresh) {
        this.logger.log(`캐시 미스 또는 강제 새로고침: ${request.symbol}`);
        
        // 3. 바이낸스 API에서 최신 가격 조회
        price = await this.binanceRepository.getCurrentPrice(request.symbol);
        
        // 4. 캐시에 저장
        await this.priceRepository.save(price);
        
        return this.success({
          symbol: price.symbol,
          price: price.price,
          source: 'api',
          age: 0
        }, 'API에서 가격 조회 완료');
      }

      // 5. 캐시된 데이터 반환
      const age = Date.now() - price.timestamp;
      return this.success({
        symbol: price.symbol,
        price: price.price,
        source: 'memory',
        age
      }, '메모리에서 가격 조회 완료');

    } catch (error) {
      this.logger.error(`가격 조회 실패: ${error.message}`);
      return this.error('가격 조회 중 오류가 발생했습니다');
    }
  }
}
```

#### 3. Domain Layer (도메인 계층)
**위치**: `src/domain/`

비즈니스의 핵심 규칙과 엔티티가 들어가는 곳입니다. 외부 시스템에 전혀 의존하지 않는 순수한 비즈니스 로직입니다.

**구성 요소**:
- **Entities**: 비즈니스 객체 (Price, TechnicalAnalysis)
- **Repository Interfaces**: 데이터 접근을 추상화한 인터페이스
- **Value Objects**: 불변 객체들

**코드 예시**:
```typescript
// src/domain/entities/price.entity.ts
export class Price {
  constructor(
    private readonly _symbol: string,
    private readonly _price: string,
    private readonly _timestamp: number
  ) {
    this.validate();
  }

  // 비즈니스 규칙: 가격은 양수여야 함
  private validate(): void {
    if (parseFloat(this._price) <= 0) {
      throw new Error('가격은 0보다 커야 합니다');
    }
  }

  // 비즈니스 로직: 가격이 만료되었는지 확인
  isExpired(validityDuration: number): boolean {
    return Date.now() - this._timestamp > validityDuration;
  }

  // 비즈니스 로직: 가격 변동률 계산
  getChangeRate(previousPrice: Price): number {
    const current = parseFloat(this._price);
    const previous = parseFloat(previousPrice._price);
    return ((current - previous) / previous) * 100;
  }

  // Getter 메서드들
  get symbol(): string { return this._symbol; }
  get price(): string { return this._price; }
  get timestamp(): number { return this._timestamp; }
}
```

**Repository 인터페이스**:
```typescript
// src/domain/repositories/price-repository.interface.ts
export interface PriceRepository {
  save(price: Price): Promise<void>;
  findBySymbol(symbol: string): Promise<Price | null>;
  deleteBySymbol(symbol: string): Promise<void>;
}
```

#### 4. Infrastructure Layer (인프라스트럭처 계층)
**위치**: `src/infrastructure/`

실제 외부 시스템과 통신하는 부분입니다. 도메인에서 정의한 인터페이스를 실제로 구현해서 데이터에 접근합니다.

**구성 요소**:
- Repository 구현체들
- 외부 API 클라이언트
- 데이터베이스 연결
- 캐시 시스템

**코드 예시**:
```typescript
// src/infrastructure/repositories/memory-price.repository.ts
@Injectable()
export class MemoryPriceRepository implements PriceRepository {
  private readonly priceCache = new Map<string, Price>();

  async save(price: Price): Promise<void> {
    this.priceCache.set(price.symbol, price);
    this.logger.log(`가격 캐시 저장: ${price.symbol} = ${price.price}`);
  }

  async findBySymbol(symbol: string): Promise<Price | null> {
    const price = this.priceCache.get(symbol);
    if (price) {
      this.logger.log(`캐시에서 가격 조회: ${symbol}`);
    }
    return price || null;
  }

  async deleteBySymbol(symbol: string): Promise<void> {
    this.priceCache.delete(symbol);
    this.logger.log(`캐시에서 가격 삭제: ${symbol}`);
  }
}

// src/infrastructure/repositories/binance-api.repository.ts
@Injectable()
export class BinanceApiRepository implements BinanceRepository {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async getCurrentPrice(symbol: string): Promise<Price> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.configService.get('BINANCE_BASE_URL')}/api/v3/ticker/price`,
        { params: { symbol } }
      );

      const data = response.data;
      return new Price(
        data.symbol,
        data.price,
        Date.now()
      );
    } catch (error) {
      this.logger.error(`바이낸스 API 호출 실패: ${error.message}`);
      throw new Error(`가격 조회 실패: ${symbol}`);
    }
  }
}
```

### 의존성 방향

이 구조의 핵심은 **의존성 방향**입니다. 모든 의존성이 도메인 계층을 향하도록 설계했습니다.

```
Presentation → Application → Domain ← Infrastructure
```

**의존성 원칙**:

1. **도메인 계층**: 어떤 외부 시스템에도 의존하지 않음
2. **애플리케이션 계층**: 도메인 인터페이스에만 의존
3. **인프라스트럭처 계층**: 도메인 인터페이스를 구현
4. **프레젠테이션 계층**: 애플리케이션 Use Case에만 의존

**의존성 주입 설정**:
```typescript
// src/application/application.module.ts
@Module({
  providers: [
    GetPriceUseCase,
    AnalyzeTechnicalUseCase,
    {
      provide: 'PriceRepository',
      useClass: MemoryPriceRepository
    },
    {
      provide: 'BinanceRepository', 
      useClass: BinanceApiRepository
    },
    {
      provide: 'AiRepository',
      useClass: GoogleAiRepository
    }
  ],
  exports: [GetPriceUseCase, AnalyzeTechnicalUseCase]
})
export class ApplicationModule {}
```

### 실제 데이터 흐름

사용자가 `GET /price/BTCUSDT` 요청을 보낼 때:

```
1. HTTP 요청 → PriceController.getPrice()
   ↓
2. Controller → GetPriceUseCase.execute(request)
   ↓
3. UseCase → PriceRepository.findBySymbol() (인터페이스 호출)
   ↓
4. Repository → MemoryPriceRepository.findBySymbol() (실제 구현)
   ↓
5. UseCase → BinanceRepository.getCurrentPrice() (캐시 미스 시)
   ↓
6. UseCase → PriceRepository.save() (새로운 가격 캐시)
   ↓
7. UseCase → Controller (응답 반환)
   ↓
8. Controller → HTTP 응답 (JSON)
```

**각 단계에서 일어나는 일**:

1. **HTTP 요청 수신**: 클라이언트가 `/price/BTCUSDT` 엔드포인트로 GET 요청
2. **Controller 처리**: 요청 파라미터 검증 및 Use Case 호출 준비
3. **Use Case 실행**: 비즈니스 로직 시작 (캐시 확인 → API 호출 → 저장)
4. **Repository 인터페이스**: 추상화된 데이터 접근 메서드 호출
5. **실제 구현체**: 메모리 캐시에서 데이터 조회
6. **외부 API 호출**: 캐시 미스 시 바이낸스 API에서 최신 데이터 조회
7. **캐시 저장**: 새로 조회한 데이터를 메모리에 저장
8. **응답 반환**: 처리된 데이터를 클라이언트에게 JSON 형태로 반환

### 이 구조의 장점

#### 1. 테스트하기 쉬움
각 계층을 독립적으로 테스트할 수 있습니다:

```typescript
// UseCase 테스트 - 실제 API 호출 없음
describe('GetPriceUseCase', () => {
  let useCase: GetPriceUseCase;
  let mockPriceRepository: jest.Mocked<PriceRepository>;
  let mockBinanceRepository: jest.Mocked<BinanceRepository>;

  beforeEach(() => {
    mockPriceRepository = {
      save: jest.fn(),
      findBySymbol: jest.fn(),
      deleteBySymbol: jest.fn()
    };
    
    mockBinanceRepository = {
      getCurrentPrice: jest.fn()
    };

    useCase = new GetPriceUseCase(mockPriceRepository, mockBinanceRepository);
  });

  it('캐시된 가격이 있으면 API 호출하지 않음', async () => {
    // Given
    const cachedPrice = new Price('BTCUSDT', '50000', Date.now());
    mockPriceRepository.findBySymbol.mockResolvedValue(cachedPrice);

    // When
    const result = await useCase.execute({ symbol: 'BTCUSDT' });

    // Then
    expect(mockBinanceRepository.getCurrentPrice).not.toHaveBeenCalled();
    expect(result.result_data.source).toBe('memory');
  });
});
```

#### 2. 유지보수하기 쉬움
비즈니스 로직을 바꿀 때 도메인 계층만 수정하면 됩니다:

```typescript
// 가격 검증 로직을 바꿀 때
export class Price {
  private validate(): void {
    // 기존: 양수 검증만
    if (parseFloat(this._price) <= 0) {
      throw new Error('가격은 0보다 커야 합니다');
    }
    
    // 새로운 검증 규칙 추가
    if (parseFloat(this._price) > 1000000) {
      throw new Error('가격이 너무 높습니다');
    }
  }
}
```

#### 3. 확장하기 쉬움
새로운 저장소나 서비스를 쉽게 추가할 수 있습니다:

```typescript
// Redis 캐시를 추가할 때
@Injectable()
export class RedisPriceRepository implements PriceRepository {
  constructor(private readonly redisService: RedisService) {}

  async save(price: Price): Promise<void> {
    await this.redisService.set(
      `price:${price.symbol}`,
      JSON.stringify(price),
      'EX',
      300 // 5분 TTL
    );
  }

  async findBySymbol(symbol: string): Promise<Price | null> {
    const data = await this.redisService.get(`price:${symbol}`);
    return data ? JSON.parse(data) : null;
  }
}

// 모듈에 등록만 하면 됨
{
  provide: 'PriceRepository',
  useClass: RedisPriceRepository // MemoryPriceRepository에서 변경
}
```

### 실제 개발 시나리오

#### 시나리오 1: 새로운 AI 서비스 추가
1. `src/domain/repositories/`에 새로운 AI 인터페이스 정의
2. `src/infrastructure/repositories/`에 실제 구현체 생성
3. `src/application/use-cases/`에 새로운 Use Case 생성
4. `src/presentation/controllers/`에 새로운 엔드포인트 추가

#### 시나리오 2: 캐시 전략 변경
1. 새로운 Repository 구현체 생성
2. DI 설정만 변경
3. 도메인 로직은 전혀 수정할 필요 없음

#### 시나리오 3: 새로운 비즈니스 규칙 추가
1. 도메인 엔티티에 새로운 메서드 추가
2. Use Case에서 새로운 로직 적용
3. 인프라스트럭처 계층은 영향 없음

이런 구조 덕분에 코드를 바꿀 때 다른 부분에 미치는 영향을 최소화할 수 있고, 각 계층의 역할이 명확하게 나뉘어서 유지보수가 쉬워집니다. 