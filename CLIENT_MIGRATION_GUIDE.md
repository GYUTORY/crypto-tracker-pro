# 클라이언트 마이그레이션 가이드 - API 서버 변경 지점

## 📋 개요

Java 마이그레이션으로 인해 **특정 API 엔드포인트의 서버 주소가 변경**됩니다. 클라이언트 개발자는 아래 변경 사항을 참고하여 API 호출 부분을 수정해야 합니다.

## 🎯 변경 대상 API 목록

### ✅ Java 서버로 이동하는 API들 (성능 중심)

| API 카테고리 | 기존 서버 | 새 서버 | 변경 이유 |
|-------------|-----------|---------|-----------|
| **기술적 지표** | Node.js | Java | CPU 집약적 계산 |
| **실시간 스트리밍** | Node.js | Java | 동시 연결 처리 |
| **AI 추천** | Node.js | Java | 병렬 처리 |
| **배치 처리** | Node.js | Java | 대량 데이터 처리 |
| **고성능 캐싱** | Node.js | Java | 메모리 효율성 |
| **뉴스 크롤링** | Node.js | Java | 병렬 크롤링 |

### ✅ Node.js 서버로 유지하는 API들

| API 카테고리 | 서버 | 유지 이유 |
|-------------|------|-----------|
| **기본 CRUD** | Node.js | 간단한 비즈니스 로직 |
| **인증/권한** | Node.js | 미들웨어 처리 |
| **파일 업로드** | Node.js | 간단한 파일 처리 |
| **사용자 관리** | Node.js | 기본적인 사용자 CRUD |

---

## 🔄 구체적인 API 변경 사항

### 1. 기술적 지표 계산 API

#### 변경 전 (Node.js):
```javascript
// 기존 호출 방식
const response = await fetch('http://localhost:3000/api/technical/rsi/BTCUSDT');
const data = await response.json();
```

#### 변경 후 (Java):
```javascript
// 새로운 호출 방식
const response = await fetch('http://localhost:8080/api/technical/rsi/BTCUSDT');
const data = await response.json();
```

#### 변경되는 엔드포인트:
- `GET /api/technical/rsi/{symbol}` - RSI 계산
- `GET /api/technical/macd/{symbol}` - MACD 계산
- `GET /api/technical/bollinger/{symbol}` - 볼린저 밴드 계산
- `GET /api/technical/all/{symbol}` - 모든 기술적 지표 계산

---

### 2. 실시간 WebSocket 스트리밍 API

#### 변경 전 (Node.js):
```javascript
// 기존 WebSocket 연결
const ws = new WebSocket('ws://localhost:3000/ws/price/BTCUSDT');
```

#### 변경 후 (Java):
```javascript
// 새로운 WebSocket 연결
const ws = new WebSocket('ws://localhost:8080/ws/price/BTCUSDT');
```

#### 변경되는 WebSocket 엔드포인트:
- `WebSocket /ws/price/{symbol}` - 실시간 가격 스트리밍
- `WebSocket /ws/ticker/{symbol}` - 실시간 티커 스트리밍
- `WebSocket /ws/kline/{symbol}` - 실시간 캔들스틱 스트리밍

---

### 3. AI 추천 API

#### 변경 전 (Node.js):
```javascript
// 기존 추천 API 호출
const response = await fetch('http://localhost:3000/api/recommendation/short-term');
const recommendations = await response.json();
```

#### 변경 후 (Java):
```javascript
// 새로운 추천 API 호출
const response = await fetch('http://localhost:8080/api/recommendation/short-term');
const recommendations = await response.json();
```

#### 변경되는 엔드포인트:
- `GET /api/recommendation/short-term` - 단기 추천 (1-7일)
- `GET /api/recommendation/medium-term` - 중기 추천 (1-4주)
- `GET /api/recommendation/long-term` - 장기 추천 (1-12개월)
- `GET /api/recommendation/all` - 전체 추천
- `WebSocket /ws/recommendation/stream` - 실시간 추천 스트림

---

### 4. 배치 처리 및 데이터 집계 API

#### 변경 전 (Node.js):
```javascript
// 기존 시장 데이터 API 호출
const response = await fetch('http://localhost:3000/api/market/summary');
const marketData = await response.json();
```

#### 변경 후 (Java):
```javascript
// 새로운 시장 데이터 API 호출
const response = await fetch('http://localhost:8080/api/market/summary');
const marketData = await response.json();
```

#### 변경되는 엔드포인트:
- `GET /api/market/summary` - 시장 요약 데이터
- `GET /api/market/aggregate` - 배치 집계 데이터
- `WebSocket /ws/market/stream` - 실시간 시장 데이터 스트림
- `POST /api/market/batch` - 배치 처리 요청

---

### 5. 고성능 뉴스 크롤링 API

#### 변경 전 (Node.js):
```javascript
// 기존 뉴스 API 호출
const response = await fetch('http://localhost:3000/api/news/latest');
const news = await response.json();
```

#### 변경 후 (Java):
```javascript
// 새로운 뉴스 API 호출
const response = await fetch('http://localhost:8080/api/news/latest');
const news = await response.json();
```

#### 변경되는 엔드포인트:
- `GET /api/news/latest` - 최신 뉴스 조회
- `GET /api/news/sentiment` - 뉴스 감정 분석
- `WebSocket /ws/news/stream` - 실시간 뉴스 스트림
- `POST /api/news/analyze` - 뉴스 영향도 분석

---

### 6. 캐싱 시스템 API

#### 변경 전 (Node.js):
```javascript
// 기존 캐시 API 호출 (없었음)
// 캐시는 서버 내부에서만 처리
```

#### 변경 후 (Java):
```javascript
// 새로운 캐시 API 호출
const response = await fetch('http://localhost:8080/api/cache/stats');
const cacheStats = await response.json();
```

#### 새로운 엔드포인트:
- `GET /api/cache/stats` - 캐시 통계 조회
- `DELETE /api/cache/{key}` - 특정 키 캐시 삭제
- `DELETE /api/cache/clear` - 전체 캐시 삭제

---

## 🛠️ 클라이언트 수정 가이드

### 1. 환경 변수 설정

#### 기존 환경 변수:
```javascript
// .env 파일
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_WS_BASE_URL=ws://localhost:3000
```

#### 새로운 환경 변수:
```javascript
// .env 파일
# Node.js 서버 (기본 API)
REACT_APP_API_BASE_URL=http://localhost:3000

# Java 서버 (성능 중심 API)
REACT_APP_JAVA_API_BASE_URL=http://localhost:8080
REACT_APP_JAVA_WS_BASE_URL=ws://localhost:8080
```

### 2. API 클라이언트 설정

#### 기존 API 클라이언트:
```javascript
// api/client.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const apiClient = {
  get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`),
  post: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};
```

#### 새로운 API 클라이언트:
```javascript
// api/client.js
const NODE_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const JAVA_API_BASE_URL = process.env.REACT_APP_JAVA_API_BASE_URL;

export const nodeApiClient = {
  get: (endpoint) => fetch(`${NODE_API_BASE_URL}${endpoint}`),
  post: (endpoint, data) => fetch(`${NODE_API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};

export const javaApiClient = {
  get: (endpoint) => fetch(`${JAVA_API_BASE_URL}${endpoint}`),
  post: (endpoint, data) => fetch(`${JAVA_API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};
```

### 3. WebSocket 클라이언트 설정

#### 기존 WebSocket 클라이언트:
```javascript
// websocket/client.js
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;

export const createWebSocket = (endpoint) => {
  return new WebSocket(`${WS_BASE_URL}${endpoint}`);
};
```

#### 새로운 WebSocket 클라이언트:
```javascript
// websocket/client.js
const NODE_WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;
const JAVA_WS_BASE_URL = process.env.REACT_APP_JAVA_WS_BASE_URL;

export const createNodeWebSocket = (endpoint) => {
  return new WebSocket(`${NODE_WS_BASE_URL}${endpoint}`);
};

export const createJavaWebSocket = (endpoint) => {
  return new WebSocket(`${JAVA_WS_BASE_URL}${endpoint}`);
};
```

### 4. API 호출 함수 수정

#### 기존 방식:
```javascript
// services/technicalAnalysis.js
export const getRSI = async (symbol) => {
  const response = await apiClient.get(`/api/technical/rsi/${symbol}`);
  return response.json();
};

// services/recommendation.js
export const getShortTermRecommendations = async () => {
  const response = await apiClient.get('/api/recommendation/short-term');
  return response.json();
};
```

#### 새로운 방식:
```javascript
// services/technicalAnalysis.js
export const getRSI = async (symbol) => {
  const response = await javaApiClient.get(`/api/technical/rsi/${symbol}`);
  return response.json();
};

// services/recommendation.js
export const getShortTermRecommendations = async () => {
  const response = await javaApiClient.get('/api/recommendation/short-term');
  return response.json();
};

// services/user.js (Node.js 서버 유지)
export const getUserProfile = async (userId) => {
  const response = await nodeApiClient.get(`/api/users/${userId}`);
  return response.json();
};
```

### 5. WebSocket 연결 수정

#### 기존 방식:
```javascript
// components/PriceChart.js
useEffect(() => {
  const ws = createWebSocket('/ws/price/BTCUSDT');
  // WebSocket 이벤트 처리
}, []);
```

#### 새로운 방식:
```javascript
// components/PriceChart.js
useEffect(() => {
  const ws = createJavaWebSocket('/ws/price/BTCUSDT');
  // WebSocket 이벤트 처리
}, []);

// components/UserNotifications.js (Node.js 서버 유지)
useEffect(() => {
  const ws = createNodeWebSocket('/ws/notifications');
  // WebSocket 이벤트 처리
}, []);
```

---

## 📋 수정 체크리스트

### Phase 1: 환경 설정 (1일)
- [ ] 환경 변수 파일 수정 (`.env`)
- [ ] API 클라이언트 설정 분리
- [ ] WebSocket 클라이언트 설정 분리

### Phase 2: 기술적 지표 API (1-2일)
- [ ] RSI API 호출 수정
- [ ] MACD API 호출 수정
- [ ] 볼린저 밴드 API 호출 수정
- [ ] 모든 기술적 지표 API 호출 수정

### Phase 3: 실시간 스트리밍 (1-2일)
- [ ] 가격 스트리밍 WebSocket 연결 수정
- [ ] 티커 스트리밍 WebSocket 연결 수정
- [ ] 캔들스틱 스트리밍 WebSocket 연결 수정

### Phase 4: AI 추천 API (1일)
- [ ] 단기 추천 API 호출 수정
- [ ] 중기 추천 API 호출 수정
- [ ] 장기 추천 API 호출 수정
- [ ] 전체 추천 API 호출 수정
- [ ] 실시간 추천 스트림 WebSocket 연결 수정

### Phase 5: 배치 처리 API (1일)
- [ ] 시장 요약 API 호출 수정
- [ ] 배치 집계 API 호출 수정
- [ ] 실시간 시장 데이터 스트림 WebSocket 연결 수정

### Phase 6: 뉴스 API (1일)
- [ ] 최신 뉴스 API 호출 수정
- [ ] 뉴스 감정 분석 API 호출 수정
- [ ] 실시간 뉴스 스트림 WebSocket 연결 수정

### Phase 7: 테스트 및 검증 (1-2일)
- [ ] 모든 API 호출 테스트
- [ ] WebSocket 연결 테스트
- [ ] 에러 처리 검증
- [ ] 성능 테스트

---

## 🚨 주의사항

### 1. 서버 상태 확인
```javascript
// 서버 상태 확인 함수
export const checkServerHealth = async () => {
  try {
    const nodeHealth = await fetch('http://localhost:3000/health');
    const javaHealth = await fetch('http://localhost:8080/actuator/health');
    
    return {
      node: nodeHealth.ok,
      java: javaHealth.ok
    };
  } catch (error) {
    console.error('서버 상태 확인 실패:', error);
    return { node: false, java: false };
  }
};
```

### 2. 에러 처리
```javascript
// API 호출 시 에러 처리
export const safeApiCall = async (apiCall, fallback = null) => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API 호출 실패:', error);
    return fallback;
  }
};
```

### 3. 로딩 상태 관리
```javascript
// 로딩 상태 관리
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const data = await javaApiClient.get('/api/recommendation/short-term');
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📞 지원 및 문의

### 개발 단계별 지원
- **Phase 1-2**: 백엔드 개발팀과 협업하여 API 스펙 확인
- **Phase 3-4**: WebSocket 연결 테스트 및 디버깅
- **Phase 5-6**: 성능 테스트 및 최적화
- **Phase 7**: 전체 시스템 통합 테스트

### 연락처
- **백엔드 개발팀**: backend@company.com
- **API 문서**: http://localhost:8080/swagger-ui.html (Java)
- **API 문서**: http://localhost:3000/api (Node.js)

---

## 📝 결론

이 가이드를 따라 단계별로 API 호출을 수정하면 **하이브리드 아키텍처**로의 전환이 완료됩니다. 

**주요 변경 사항**:
1. **포트 변경**: 3000 → 8080 (Java 서버)
2. **API 클라이언트 분리**: Node.js용, Java용
3. **WebSocket 연결 분리**: 서버별 연결 관리
4. **환경 변수 추가**: Java 서버 URL 설정

**예상 소요 시간**: 5-7일 (개발자 1명 기준)

성공적인 마이그레이션을 위해 단계별로 진행하고 충분한 테스트를 진행하세요! 🚀



