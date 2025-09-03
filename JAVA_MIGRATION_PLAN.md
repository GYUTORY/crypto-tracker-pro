# Java 마이그레이션 계획 - 성능 중심 컴포넌트

## 📋 개요

현재 NestJS 프로젝트에서 **성능이 중요한 컴포넌트들**을 Java로 마이그레이션하여 하이브리드 아키텍처를 구축합니다.

## 🎯 마이그레이션 대상 선정 기준

### Java 장점을 살릴 수 있는 영역
- **CPU 집약적 계산**: 기술적 지표, AI 분석
- **메모리 효율성**: 캐싱, 대량 데이터 처리
- **멀티스레딩**: 병렬 처리, 동시 연결
- **실시간 스트리밍**: WebSocket, 데이터 집계

### Node.js로 유지할 영역
- **REST API**: 컨트롤러, 라우팅
- **간단한 비즈니스 로직**: CRUD 작업
- **미들웨어**: 인증, 로깅, 검증

## 🚀 마이그레이션 대상 API 및 컴포넌트

### 1. 기술적 지표 계산 API

#### 현재 위치: `src/infrastructure/services/technical-analysis/technical-indicators.service.ts`

#### Java로 마이그레이션 이유:
- **CPU 집약적 계산**: RSI, MACD, 볼린저 밴드 등 복잡한 수학 계산
- **병렬 처리**: 여러 심볼의 기술적 지표를 동시 계산
- **메모리 효율성**: 대량의 가격 데이터 처리

#### Java 구현:
```java
@Service
@Slf4j
public class TechnicalIndicatorsEngine {
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    // 고성능 기술적 지표 계산
    public CompletableFuture<TechnicalData> calculateAllIndicators(String symbol, List<CandleData> candles) {
        return CompletableFuture.supplyAsync(() -> {
            TechnicalData data = new TechnicalData();
            
            // 병렬 계산
            CompletableFuture<Double> rsiFuture = CompletableFuture.supplyAsync(() -> calculateRSI(candles));
            CompletableFuture<MACDResult> macdFuture = CompletableFuture.supplyAsync(() -> calculateMACD(candles));
            CompletableFuture<BollingerBands> bbFuture = CompletableFuture.supplyAsync(() -> calculateBollingerBands(candles));
            
            // 모든 계산 완료 대기
            CompletableFuture.allOf(rsiFuture, macdFuture, bbFuture).join();
            
            data.setRsi(rsiFuture.get());
            data.setMacd(macdFuture.get().getMacd());
            data.setMacdSignal(macdFuture.get().getSignal());
            data.setBollingerUpper(bbFuture.get().getUpper());
            data.setBollingerLower(bbFuture.get().getLower());
            
            return data;
        }, executorService);
    }
}
```

#### API 엔드포인트:
- `GET /api/technical/rsi/{symbol}` - RSI 계산
- `GET /api/technical/macd/{symbol}` - MACD 계산
- `GET /api/technical/bollinger/{symbol}` - 볼린저 밴드 계산
- `GET /api/technical/all/{symbol}` - 모든 기술적 지표 계산

---

### 2. 실시간 WebSocket 스트리밍 API

#### 현재 위치: `src/infrastructure/streaming/binance-streaming.repository.ts`

#### Java로 마이그레이션 이유:
- **동시 연결 처리**: 수천 개의 WebSocket 연결 동시 처리
- **메모리 효율성**: 대량의 실시간 데이터 스트리밍
- **백프레셔 제어**: Reactor의 백프레셔로 메모리 오버플로우 방지

#### Java 구현:
```java
@Service
@Slf4j
public class BinanceWebSocketService {
    
    private final WebSocketClient webSocketClient;
    private final Map<String, Flux<PriceData>> priceStreams = new ConcurrentHashMap<>();
    
    public Flux<PriceData> subscribeToPriceStream(String symbol) {
        return priceStreams.computeIfAbsent(symbol, this::createPriceStream);
    }
    
    private Flux<PriceData> createPriceStream(String symbol) {
        return webSocketClient
            .get()
            .uri("wss://stream.binance.com:9443/ws/" + symbol.toLowerCase() + "@ticker")
            .retrieve()
            .bodyToFlux(String.class)
            .map(this::parsePriceData)
            .doOnError(error -> log.error("WebSocket error for {}: {}", symbol, error.getMessage()))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
            .share(); // 여러 구독자가 같은 스트림 공유
    }
}
```

#### API 엔드포인트:
- `WebSocket /ws/price/{symbol}` - 실시간 가격 스트리밍
- `WebSocket /ws/ticker/{symbol}` - 실시간 티커 스트리밍
- `WebSocket /ws/kline/{symbol}` - 실시간 캔들스틱 스트리밍

---

### 3. 고성능 캐싱 시스템

#### 현재 위치: 메모리 기반 캐시 (분산되어 있음)

#### Java로 마이그레이션 이유:
- **메모리 효율성**: JVM의 메모리 관리로 캐시 성능 최적화
- **GC 최적화**: Caffeine의 GC 친화적 설계
- **통계 모니터링**: 캐시 히트율, 미스율 등 성능 지표

#### Java 구현:
```java
@Service
@Slf4j
public class HighPerformanceCache {
    
    // 고성능 인메모리 캐시 (Caffeine 사용)
    private final Cache<String, Object> priceCache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofSeconds(30))
        .recordStats()
        .build();
    
    // 기술적 지표 캐시 (더 긴 TTL)
    private final Cache<String, TechnicalData> technicalCache = Caffeine.newBuilder()
        .maximumSize(1_000)
        .expireAfterWrite(Duration.ofMinutes(5))
        .recordStats()
        .build();
    
    // 뉴스 캐시
    private final Cache<String, List<News>> newsCache = Caffeine.newBuilder()
        .maximumSize(100)
        .expireAfterWrite(Duration.ofMinutes(10))
        .recordStats()
        .build();
    
    public <T> T getOrLoad(String key, Supplier<T> loader, Class<T> type) {
        return (T) priceCache.get(key, k -> loader.get());
    }
}
```

#### API 엔드포인트:
- `GET /api/cache/stats` - 캐시 통계 조회
- `DELETE /api/cache/{key}` - 특정 키 캐시 삭제
- `DELETE /api/cache/clear` - 전체 캐시 삭제

---

### 4. AI 추천 엔진 (고성능 버전)

#### 현재 위치: `src/infrastructure/services/recommendation/coin-recommendation.service.ts`

#### Java로 마이그레이션 이유:
- **병렬 처리**: 여러 데이터 소스 동시 수집
- **캐싱**: 고성능 캐시로 반복 계산 방지
- **스트리밍**: 실시간 추천 업데이트

#### Java 구현:
```java
@Service
@Slf4j
public class HighPerformanceRecommendationEngine {
    
    private final AiRepository aiRepository;
    private final TechnicalIndicatorsEngine technicalEngine;
    private final HighPerformanceCache cache;
    
    // 비동기 AI 추천 생성
    public CompletableFuture<List<Recommendation>> generateRecommendationsAsync(
            TimeframeType timeframe, List<String> symbols) {
        
        return CompletableFuture.supplyAsync(() -> {
            // 1. 캐시된 데이터 확인
            String cacheKey = "recommendations:" + timeframe + ":" + String.join(",", symbols);
            List<Recommendation> cached = cache.getOrLoad(cacheKey, () -> null, List.class);
            
            if (cached != null) {
                return cached;
            }
            
            // 2. 병렬 데이터 수집
            CompletableFuture<Map<String, PriceData>> priceFuture = collectPriceDataAsync(symbols);
            CompletableFuture<Map<String, TechnicalData>> technicalFuture = collectTechnicalDataAsync(symbols);
            CompletableFuture<List<News>> newsFuture = collectNewsDataAsync();
            
            // 3. 모든 데이터 수집 완료 대기
            CompletableFuture.allOf(priceFuture, technicalFuture, newsFuture).join();
            
            // 4. AI 분석 요청
            String prompt = buildAnalysisPrompt(priceFuture.get(), technicalFuture.get(), newsFuture.get(), timeframe);
            String aiResponse = aiRepository.analyze(prompt);
            List<Recommendation> recommendations = parseAIResponse(aiResponse);
            
            // 5. 결과 캐싱
            cache.put(cacheKey, recommendations);
            
            return recommendations;
        });
    }
}
```

#### API 엔드포인트:
- `GET /api/recommendation/short-term` - 단기 추천 (1-7일)
- `GET /api/recommendation/medium-term` - 중기 추천 (1-4주)
- `GET /api/recommendation/long-term` - 장기 추천 (1-12개월)
- `GET /api/recommendation/all` - 전체 추천
- `WebSocket /ws/recommendation/stream` - 실시간 추천 스트림

---

### 5. 배치 처리 및 데이터 집계 API

#### 현재 위치: 개별 서비스에 분산

#### Java로 마이그레이션 이유:
- **대량 처리**: Java의 스레드 풀로 대량 데이터 처리
- **스트리밍**: Reactor로 실시간 데이터 처리
- **메모리 효율성**: 배치 처리로 메모리 사용량 최적화

#### Java 구현:
```java
@Service
@Slf4j
public class MarketDataAggregator {
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    // 대량 데이터 배치 처리
    public CompletableFuture<MarketSummary> aggregateMarketData(List<String> symbols) {
        return CompletableFuture.supplyAsync(() -> {
            List<CompletableFuture<SymbolData>> futures = symbols.stream()
                .map(symbol -> CompletableFuture.supplyAsync(() -> fetchSymbolData(symbol), executorService))
                .collect(Collectors.toList());
            
            // 모든 데이터 수집
            List<SymbolData> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
            
            // 집계 계산
            return calculateMarketSummary(results);
        }, executorService);
    }
    
    // 실시간 데이터 스트림 집계
    public Flux<MarketSummary> streamMarketAggregation(List<String> symbols) {
        return Flux.fromIterable(symbols)
            .flatMap(this::getSymbolStream)
            .buffer(Duration.ofSeconds(1)) // 1초마다 배치
            .map(this::aggregateBatch)
            .doOnNext(summary -> log.info("Market summary: {}", summary));
    }
}
```

#### API 엔드포인트:
- `GET /api/market/summary` - 시장 요약 데이터
- `GET /api/market/aggregate` - 배치 집계 데이터
- `WebSocket /ws/market/stream` - 실시간 시장 데이터 스트림
- `POST /api/market/batch` - 배치 처리 요청

---

### 6. 고성능 뉴스 크롤링 및 분석

#### 현재 위치: `src/infrastructure/repositories/news/news-crawler.repository.ts`

#### Java로 마이그레이션 이유:
- **병렬 크롤링**: 여러 뉴스 소스 동시 크롤링
- **메모리 효율성**: 대량 뉴스 데이터 처리
- **실시간 분석**: 뉴스 감정 분석 및 영향도 평가

#### Java 구현:
```java
@Service
@Slf4j
public class HighPerformanceNewsCrawler {
    
    private final WebClient webClient;
    private final ExecutorService executorService = Executors.newFixedThreadPool(20);
    
    // 병렬 뉴스 크롤링
    public CompletableFuture<List<News>> crawlAllNewsSources() {
        List<String> newsSources = Arrays.asList(
            "https://cointelegraph.com/rss/tag/bitcoin",
            "https://cryptonews.com/news/bitcoin-news/feed/",
            "https://www.newsbtc.com/feed/",
            "https://decrypt.co/feed"
        );
        
        List<CompletableFuture<List<News>>> futures = newsSources.stream()
            .map(source -> CompletableFuture.supplyAsync(() -> crawlNewsSource(source), executorService))
            .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(Collectors.toList()));
    }
    
    // 실시간 뉴스 스트림
    public Flux<News> streamLatestNews() {
        return Flux.interval(Duration.ofMinutes(5))
            .flatMap(tick -> crawlAllNewsSources())
            .flatMapIterable(newsList -> newsList)
            .distinct(News::getUrl)
            .doOnNext(news -> log.info("New news: {}", news.getTitle()));
    }
}
```

#### API 엔드포인트:
- `GET /api/news/latest` - 최신 뉴스 조회
- `GET /api/news/sentiment` - 뉴스 감정 분석
- `WebSocket /ws/news/stream` - 실시간 뉴스 스트림
- `POST /api/news/analyze` - 뉴스 영향도 분석

---

## 🏗️ 하이브리드 아키텍처 설계

### 전체 시스템 구조
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Gateway                              │
│              (Load Balancer + Routing)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌────────▼────────┐
│   Node.js API  │        │   Java Engine   │
│   (REST API)   │◄──────►│   (Performance) │
│                │        │                 │
│ - 컨트롤러     │        │ - 기술적 지표   │
│ - 라우팅       │        │ - 캐싱          │
│ - 미들웨어     │        │ - 배치 처리     │
│ - 간단한 로직  │        │ - 스트리밍      │
│ - 인증/권한    │        │ - AI 추천       │
└────────────────┘        └─────────────────┘
        │                           │
        │                           │
┌───────▼────────┐        ┌────────▼────────┐
│   Database     │        │   External APIs │
│   (PostgreSQL) │        │   (Binance, AI) │
└────────────────┘        └─────────────────┘
```

### 통신 방식
1. **HTTP REST API**: Node.js ↔ Java 간 통신
2. **WebSocket**: 실시간 데이터 스트리밍
3. **Message Queue**: 비동기 작업 처리 (Redis/RabbitMQ)
4. **Shared Cache**: Redis를 통한 데이터 공유

---

## 📊 성능 비교 및 기대 효과

### Java vs Node.js 성능 비교

| 컴포넌트 | Java 성능 | Node.js 성능 | 개선 효과 |
|----------|-----------|--------------|-----------|
| **기술적 지표 계산** | ✅ 멀티스레딩, JIT 컴파일 | ❌ 단일 스레드 | **3-5배 성능 향상** |
| **메모리 관리** | ✅ GC 최적화, 힙 관리 | ❌ V8 메모리 제한 | **메모리 사용량 50% 감소** |
| **대량 데이터 처리** | ✅ 스트림 처리, 배치 | ❌ 메모리 부족 | **10배 처리량 증가** |
| **동시 연결** | ✅ 스레드 풀, NIO | ✅ 이벤트 루프 | **동시 연결 5배 증가** |
| **실시간 스트리밍** | ✅ 백프레셔, 배압 제어 | ✅ 비동기 I/O | **지연시간 70% 감소** |

### 예상 성능 개선 지표
- **응답 시간**: 평균 2-5초 → 0.5-1초 (80% 개선)
- **동시 처리**: 100 요청/분 → 500 요청/분 (5배 증가)
- **메모리 사용량**: 2GB → 1GB (50% 감소)
- **CPU 사용률**: 80% → 40% (50% 감소)

---

## 🚀 마이그레이션 로드맵

### Phase 1: 핵심 성능 컴포넌트 (2-3주)
- [ ] **기술적 지표 계산 엔진** 마이그레이션
- [ ] **고성능 캐싱 시스템** 구축
- [ ] **기본 Java 서비스** 개발

### Phase 2: 실시간 처리 (2-3주)
- [ ] **WebSocket 스트리밍** 마이그레이션
- [ ] **실시간 데이터 집계** 시스템 구축
- [ ] **배치 처리 시스템** 개발

### Phase 3: AI 및 고급 기능 (3-4주)
- [ ] **AI 추천 엔진** 마이그레이션
- [ ] **고성능 뉴스 크롤링** 시스템 구축
- [ ] **실시간 추천 스트림** 개발

### Phase 4: 통합 및 최적화 (2-3주)
- [ ] **하이브리드 아키텍처** 통합
- [ ] **성능 테스트** 및 최적화
- [ ] **모니터링** 및 로깅 시스템 구축

---

## 🛠️ 기술 스택

### Java 기술 스택
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: PostgreSQL + Redis
- **WebSocket**: Spring WebFlux + Reactor
- **Cache**: Caffeine + Redis
- **HTTP Client**: WebClient
- **Monitoring**: Spring Actuator + Micrometer

### Node.js 기술 스택 (유지)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **API Documentation**: Swagger

---

## 📈 모니터링 및 관찰성

### 성능 모니터링
- **Application Metrics**: Spring Actuator + Micrometer
- **JVM Metrics**: GC, 힙 사용량, 스레드 상태
- **Business Metrics**: API 응답 시간, 처리량, 에러율
- **Infrastructure Metrics**: CPU, 메모리, 네트워크

### 로깅 및 추적
- **Structured Logging**: JSON 형태 로그
- **Distributed Tracing**: OpenTelemetry
- **Error Tracking**: Sentry
- **Health Checks**: Spring Boot Actuator

---

## 🔧 개발 환경 설정

### 필수 도구
- **JDK 17**: OpenJDK 또는 Oracle JDK
- **Maven 3.8+**: 빌드 도구
- **Docker**: 컨테이너화
- **Redis**: 캐싱 및 메시지 큐
- **PostgreSQL**: 데이터베이스

### 개발 환경
```bash
# Java 서비스 실행
cd crypto-tracker-pro-spring
mvn spring-boot:run

# Node.js 서비스 실행
cd crypto-tracker-pro
npm run start:dev

# Redis 실행
docker run -d -p 6379:6379 redis:alpine

# PostgreSQL 실행
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:13
```

---

## 📝 결론

이 마이그레이션 계획을 통해 **성능이 중요한 컴포넌트들**을 Java로 전환하여:

1. **성능 대폭 향상**: 응답 시간 80% 개선, 처리량 5배 증가
2. **안정성 향상**: JVM의 안정적인 메모리 관리
3. **확장성 확보**: 멀티스레딩으로 수평 확장 가능
4. **비용 효율성**: 리소스 사용량 50% 감소

**하이브리드 아키텍처**를 통해 각 기술의 장점을 최대한 활용할 수 있습니다! 🚀
