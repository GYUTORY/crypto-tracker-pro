# Java 개발자 마이그레이션 가이드

## 📋 개요

현재 NestJS 프로젝트에서 **성능이 중요한 컴포넌트들**을 Java로 마이그레이션하여 하이브리드 아키텍처를 구축합니다. Java 개발자는 성능 중심의 백엔드 서비스를 담당합니다.

## 🎯 Java 개발자 담당 영역

### ✅ Java 서버에서 구현할 기능들

| 기능 영역 | 담당 범위 | 기술 스택 | 우선순위 |
|----------|-----------|-----------|----------|
| **기술적 지표 계산** | RSI, MACD, 볼린저 밴드 등 | Spring Boot + Reactor | 높음 |
| **실시간 WebSocket 스트리밍** | 바이낸스 실시간 데이터 | Spring WebFlux + WebSocket | 높음 |
| **AI 추천 엔진** | Google Gemini AI 연동 | Spring Boot + Async | 높음 |
| **배치 처리 및 데이터 집계** | 대량 데이터 처리 | Spring Batch + CompletableFuture | 중간 |
| **고성능 캐싱 시스템** | 인메모리 캐싱 | Caffeine + Redis | 중간 |
| **뉴스 크롤링 및 분석** | 병렬 뉴스 수집 | WebClient + ExecutorService | 중간 |

### ❌ Node.js 서버에서 담당할 기능들

| 기능 영역 | 담당 범위 | 이유 |
|----------|-----------|------|
| **API 게이트웨이** | 모든 요청의 진입점 | 라우팅 및 로드밸런싱 |
| **사용자 관리 시스템** | 회원가입, 로그인, 프로필 | 인증/권한 처리 |
| **알림 시스템** | 실시간 알림, 이메일, 푸시 | 사용자 인터랙션 |
| **대시보드 데이터 집계** | 사용자별 맞춤 데이터 | 개인화 서비스 |
| **모바일 API** | 모바일 앱 전용 API | 모바일 최적화 |
| **관리자 대시보드** | 시스템 모니터링, 관리 | 운영 관리 |

---

## 🏗️ Java 프로젝트 구조

### 프로젝트 생성
```bash
# Spring Boot 프로젝트 생성
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.2.0 \
  -d baseDir=crypto-tracker-pro-spring \
  -d groupId=com.cryptotracker \
  -d artifactId=crypto-tracker-pro-spring \
  -d name=crypto-tracker-pro-spring \
  -d description="Crypto Tracker Pro Spring Boot Version" \
  -d packageName=com.cryptotracker \
  -d packaging=jar \
  -d javaVersion=17 \
  -d dependencies=web,data-jpa,validation,actuator,websocket,webflux \
  -o crypto-tracker-pro-spring.zip

unzip crypto-tracker-pro-spring.zip
cd crypto-tracker-pro-spring
```

### 디렉토리 구조
```
src/main/java/com/cryptotracker/
├── CryptoTrackerApplication.java
├── config/
│   ├── AppConfig.java
│   ├── BinanceConfig.java
│   ├── GoogleAIConfig.java
│   └── WebConfig.java
├── domain/
│   ├── entities/
│   │   ├── Price.java
│   │   ├── News.java
│   │   ├── TechnicalAnalysis.java
│   │   ├── PricePrediction.java
│   │   └── Recommendation.java
│   ├── repositories/
│   │   ├── AiRepository.java
│   │   ├── BinanceRepository.java
│   │   └── NewsRepository.java
│   └── enums/
│       ├── TimeframeType.java
│       └── RecommendationReason.java
├── application/
│   ├── services/
│   │   ├── RecommendationService.java
│   │   ├── TechnicalAnalysisService.java
│   │   └── PricePredictionService.java
│   └── usecases/
│       ├── GetShortTermRecommendationsUseCase.java
│       ├── GetMediumTermRecommendationsUseCase.java
│       ├── GetLongTermRecommendationsUseCase.java
│       └── GetAllRecommendationsUseCase.java
├── infrastructure/
│   ├── repositories/
│   │   ├── GoogleAiRepository.java
│   │   ├── BinanceApiRepository.java
│   │   └── NewsCrawlerRepository.java
│   └── services/
│       ├── CoinRecommendationService.java
│       └── TechnicalIndicatorsService.java
├── presentation/
│   ├── controllers/
│   │   ├── RecommendationController.java
│   │   ├── TechnicalController.java
│   │   ├── MarketController.java
│   │   └── NewsController.java
│   └── dto/
│       ├── BaseResponse.java
│       ├── RecommendationDto.java
│       ├── TechnicalAnalysisDto.java
│       └── MarketDataDto.java
└── shared/
    ├── BaseService.java
    └── Logger.java
```

---

## 🚀 핵심 구현 사항

### 1. 기술적 지표 계산 엔진

#### TechnicalIndicatorsEngine.java
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
    
    // 고성능 RSI 계산 (배열 기반)
    private double calculateRSI(List<CandleData> candles) {
        double[] prices = candles.stream()
            .mapToDouble(CandleData::getClose)
            .toArray();
        
        double[] gains = new double[prices.length - 1];
        double[] losses = new double[prices.length - 1];
        
        for (int i = 1; i < prices.length; i++) {
            double change = prices[i] - prices[i - 1];
            gains[i - 1] = change > 0 ? change : 0;
            losses[i - 1] = change < 0 ? Math.abs(change) : 0;
        }
        
        // 14일 평균 계산
        double avgGain = Arrays.stream(gains).skip(Math.max(0, gains.length - 14)).average().orElse(0);
        double avgLoss = Arrays.stream(losses).skip(Math.max(0, losses.length - 14)).average().orElse(0);
        
        if (avgLoss == 0) return 100;
        
        double rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
}
```

### 2. 실시간 WebSocket 스트리밍

#### BinanceWebSocketService.java
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

### 3. AI 추천 엔진

#### HighPerformanceRecommendationEngine.java
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

### 4. 고성능 캐싱 시스템

#### HighPerformanceCache.java
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
    
    // 캐시 통계 모니터링
    public CacheStats getStats() {
        return priceCache.stats();
    }
}
```

---

## 📊 API 엔드포인트 구현

### 1. 기술적 지표 API

#### TechnicalController.java
```java
@RestController
@RequestMapping("/api/technical")
@Tag(name = "Technical Analysis", description = "기술적 지표 계산 API")
@Slf4j
public class TechnicalController {
    
    private final TechnicalIndicatorsEngine technicalEngine;
    
    @GetMapping("/rsi/{symbol}")
    @Operation(summary = "RSI 계산", description = "특정 심볼의 RSI 값을 계산합니다.")
    public ResponseEntity<BaseResponse<Double>> getRSI(@PathVariable String symbol) {
        try {
            List<CandleData> candles = fetchCandleData(symbol);
            Double rsi = technicalEngine.calculateRSI(candles);
            return ResponseEntity.ok(BaseResponse.success(rsi, "RSI 계산 완료"));
        } catch (Exception e) {
            log.error("RSI 계산 실패: {}", e.getMessage());
            return ResponseEntity.ok(BaseResponse.fail("RSI 계산 실패: " + e.getMessage()));
        }
    }
    
    @GetMapping("/macd/{symbol}")
    @Operation(summary = "MACD 계산", description = "특정 심볼의 MACD 값을 계산합니다.")
    public ResponseEntity<BaseResponse<MACDResult>> getMACD(@PathVariable String symbol) {
        // MACD 계산 구현
    }
    
    @GetMapping("/bollinger/{symbol}")
    @Operation(summary = "볼린저 밴드 계산", description = "특정 심볼의 볼린저 밴드를 계산합니다.")
    public ResponseEntity<BaseResponse<BollingerBands>> getBollingerBands(@PathVariable String symbol) {
        // 볼린저 밴드 계산 구현
    }
    
    @GetMapping("/all/{symbol}")
    @Operation(summary = "모든 기술적 지표 계산", description = "특정 심볼의 모든 기술적 지표를 계산합니다.")
    public ResponseEntity<BaseResponse<TechnicalData>> getAllIndicators(@PathVariable String symbol) {
        // 모든 지표 계산 구현
    }
}
```

### 2. AI 추천 API

#### RecommendationController.java
```java
@RestController
@RequestMapping("/api/recommendation")
@Tag(name = "Recommendation", description = "AI 추천 API")
@Slf4j
public class RecommendationController {
    
    private final HighPerformanceRecommendationEngine recommendationEngine;
    
    @GetMapping("/short-term")
    @Operation(summary = "단기 추천 조회", description = "1-7일 단기 투자를 위한 암호화폐 추천을 조회합니다.")
    public ResponseEntity<BaseResponse<List<Recommendation>>> getShortTermRecommendations() {
        try {
            List<Recommendation> recommendations = recommendationEngine
                .generateRecommendationsAsync(TimeframeType.SHORT_TERM, getDefaultSymbols())
                .get(10, TimeUnit.SECONDS); // 10초 타임아웃
            
            return ResponseEntity.ok(BaseResponse.success(recommendations, "단기 추천 조회 완료"));
        } catch (Exception e) {
            log.error("단기 추천 조회 실패: {}", e.getMessage());
            return ResponseEntity.ok(BaseResponse.fail("단기 추천 조회 실패: " + e.getMessage()));
        }
    }
    
    @GetMapping("/medium-term")
    @Operation(summary = "중기 추천 조회", description = "1-4주 중기 투자를 위한 암호화폐 추천을 조회합니다.")
    public ResponseEntity<BaseResponse<List<Recommendation>>> getMediumTermRecommendations() {
        // 중기 추천 구현
    }
    
    @GetMapping("/long-term")
    @Operation(summary = "장기 추천 조회", description = "1-12개월 장기 투자를 위한 암호화폐 추천을 조회합니다.")
    public ResponseEntity<BaseResponse<List<Recommendation>>> getLongTermRecommendations() {
        // 장기 추천 구현
    }
    
    @GetMapping("/all")
    @Operation(summary = "전체 추천 조회", description = "단기, 중기, 장기 추천을 모두 조회합니다.")
    public ResponseEntity<BaseResponse<AllRecommendationsResponse>> getAllRecommendations() {
        // 전체 추천 구현
    }
}
```

### 3. WebSocket 스트리밍 API

#### WebSocketConfig.java
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(priceWebSocketHandler(), "/ws/price/{symbol}")
               .setAllowedOrigins("*");
        registry.addHandler(tickerWebSocketHandler(), "/ws/ticker/{symbol}")
               .setAllowedOrigins("*");
        registry.addHandler(klineWebSocketHandler(), "/ws/kline/{symbol}")
               .setAllowedOrigins("*");
    }
    
    @Bean
    public WebSocketHandler priceWebSocketHandler() {
        return new PriceWebSocketHandler();
    }
}
```

---

## 🛠️ 기술 스택 및 의존성

### pom.xml 의존성
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.cryptotracker</groupId>
    <artifactId>crypto-tracker-pro-spring</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <!-- Cache -->
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
        </dependency>
        
        <!-- Google AI -->
        <dependency>
            <groupId>com.google.cloud</groupId>
            <artifactId>google-cloud-ai-generativelanguage</artifactId>
            <version>0.1.0</version>
        </dependency>
        
        <!-- Swagger/OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.2.0</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 📈 성능 최적화 가이드

### 1. JVM 튜닝
```bash
# JVM 옵션 설정
export JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### 2. 스레드 풀 설정
```java
@Configuration
public class ThreadPoolConfig {
    
    @Bean
    public ExecutorService technicalCalculationExecutor() {
        return Executors.newFixedThreadPool(
            Runtime.getRuntime().availableProcessors() * 2
        );
    }
    
    @Bean
    public ExecutorService webSocketExecutor() {
        return Executors.newCachedThreadPool();
    }
}
```

### 3. 캐시 최적화
```java
@Configuration
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(5))
            .recordStats());
        return cacheManager;
    }
}
```

---

## 🚀 개발 환경 설정

### 1. 필수 도구
- **JDK 17**: OpenJDK 또는 Oracle JDK
- **Maven 3.8+**: 빌드 도구
- **IDE**: IntelliJ IDEA 또는 Eclipse
- **Docker**: 컨테이너화

### 2. 개발 환경 실행
```bash
# 프로젝트 클론
git clone <repository-url>
cd crypto-tracker-pro-spring

# 의존성 설치
mvn clean install

# 개발 서버 실행
mvn spring-boot:run

# 또는 IDE에서 실행
# CryptoTrackerApplication.java 실행
```

### 3. 환경 변수 설정
```bash
# .env 파일 또는 환경 변수
GOOGLE_AI_API_KEY=your-google-ai-api-key
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key
```

---

## 📊 모니터링 및 로깅

### 1. Actuator 엔드포인트
- `GET /actuator/health` - 서버 상태 확인
- `GET /actuator/metrics` - 메트릭 조회
- `GET /actuator/caches` - 캐시 상태 확인

### 2. 로깅 설정
```yaml
# application.yml
logging:
  level:
    com.cryptotracker: INFO
    org.springframework.web: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

---

## 📝 개발 체크리스트

### Phase 1: 기본 설정 (1주)
- [ ] Spring Boot 프로젝트 생성
- [ ] 기본 디렉토리 구조 설정
- [ ] 의존성 설정 및 빌드 확인
- [ ] 기본 컨트롤러 구현

### Phase 2: 핵심 기능 구현 (2주)
- [ ] 기술적 지표 계산 엔진 구현
- [ ] 바이낸스 API 연동
- [ ] Google AI API 연동
- [ ] 기본 캐싱 시스템 구현

### Phase 3: 실시간 기능 구현 (2주)
- [ ] WebSocket 스트리밍 구현
- [ ] 실시간 데이터 처리
- [ ] AI 추천 엔진 구현
- [ ] 배치 처리 시스템 구현

### Phase 4: 최적화 및 테스트 (1주)
- [ ] 성능 최적화
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] API 문서화

---

## 📞 협업 및 문의

### Node.js 개발팀과의 협업
- **API 스펙 공유**: Swagger 문서 공유
- **데이터 형식 통일**: JSON 응답 형식 표준화
- **에러 처리**: 일관된 에러 응답 형식

### 프론트엔드 개발팀과의 협업
- **API 문서**: Swagger UI 제공
- **WebSocket 연결**: 실시간 데이터 스트리밍 가이드
- **테스트 환경**: 개발용 API 서버 제공

### 연락처
- **프로젝트 매니저**: pm@company.com
- **Node.js 개발팀**: nodejs@company.com
- **프론트엔드 개발팀**: frontend@company.com

---

## 📝 결론

Java 개발자는 **성능이 중요한 컴포넌트들**을 담당하여:

1. **고성능 기술적 지표 계산** - 멀티스레딩 활용
2. **실시간 데이터 스트리밍** - WebSocket + Reactor
3. **AI 추천 엔진** - 비동기 처리 + 캐싱
4. **배치 처리 시스템** - 대량 데이터 처리

**예상 소요 시간**: 6-8주 (개발자 1명 기준)

성공적인 마이그레이션을 위해 단계별로 진행하고 충분한 테스트를 진행하세요! 🚀



