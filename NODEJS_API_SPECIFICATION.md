# 🚀 Crypto Tracker Pro - Node.js API 명세서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [API 엔드포인트](#api-엔드포인트)
4. [데이터 모델](#데이터-모델)
5. [인증 및 보안](#인증-및-보안)
6. [에러 처리](#에러-처리)
7. [실시간 통신](#실시간-통신)
8. [개발 환경 설정](#개발-환경-설정)
9. [배포 정보](#배포-정보)

---

## 🎯 프로젝트 개요

### 프로젝트 설명
Crypto Tracker Pro는 암호화폐 시장 데이터를 실시간으로 추적하고, AI 기반 기술적 분석과 투자 추천을 제공하는 종합 플랫폼입니다.

### 주요 기능
- **실시간 가격 모니터링**: Binance API를 통한 실시간 암호화폐 가격 추적
- **AI 기반 분석**: Google Gemini AI를 활용한 기술적 분석 및 투자 추천
- **사용자 관리**: 회원가입, 로그인, 프로필 관리
- **개인화 대시보드**: 사용자별 맞춤형 시장 정보 및 관심 종목 관리
- **알림 시스템**: 실시간 가격 알림 및 시장 이벤트 알림
- **뉴스 크롤링**: 암호화폐 관련 최신 뉴스 및 시장 동향

### 아키텍처
- **Backend**: Node.js + NestJS (TypeScript)
- **Database**: PostgreSQL (사용자 데이터, 설정)
- **Cache**: Redis (실시간 데이터 캐싱)
- **AI Engine**: Google Gemini AI
- **External APIs**: Binance API, Exchange Rate API

---

## 🛠 기술 스택

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18.x+

### Database & Cache
- **Primary DB**: PostgreSQL 15+
- **ORM**: TypeORM
- **Cache**: Redis 7.x

### External Services
- **AI Service**: Google Gemini AI
- **Crypto Data**: Binance API
- **Exchange Rates**: Exchange Rate API

### Authentication
- **JWT**: JSON Web Tokens
- **Password Hashing**: bcrypt
- **Guards**: JWT Auth Guard

---

## 🔌 API 엔드포인트

### Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

### API Documentation
```
Swagger UI: http://localhost:3000/api-docs
```

---

## 🔐 인증 및 보안

### 인증 방식
- **JWT Token**: Access Token + Refresh Token
- **HttpOnly Cookies**: 보안 강화된 토큰 저장
- **Token Expiry**: Access Token (15분), Refresh Token (7일)

### 보안 헤더
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 👤 사용자 관리 API

### 1. 회원가입
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "crypto_trader",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "crypto_trader",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-01-27T10:00:00Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 2. 로그인
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "crypto_trader"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 3. 토큰 갱신
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### 4. 로그아웃
```http
POST /api/auth/logout
```

---

## 💰 가격 데이터 API

### 1. 실시간 가격 조회
```http
GET /api/price/{symbol}
```

**Parameters:**
- `symbol`: 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "price": "43000.50",
    "timestamp": 1706342400000,
    "change24h": "2.5",
    "volume24h": "1500000000"
  }
}
```

### 2. 여러 심볼 가격 조회
```http
GET /api/price/batch
```

**Query Parameters:**
- `symbols`: 쉼표로 구분된 심볼들 (예: BTCUSDT,ETHUSDT,ADAUSDT)

---

## 📊 기술적 지표 API

### 1. RSI (Relative Strength Index)
```http
GET /api/technical/rsi/{symbol}
```

**Query Parameters:**
- `period`: RSI 계산 기간 (기본값: 14)
- `timeframe`: 시간 프레임 (1m, 5m, 15m, 1h, 4h, 1d)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "rsi": 65.4,
    "period": 14,
    "timeframe": "1h",
    "timestamp": 1706342400000,
    "interpretation": "neutral"
  }
}
```

### 2. MACD (Moving Average Convergence Divergence)
```http
GET /api/technical/macd/{symbol}
```

**Query Parameters:**
- `fastPeriod`: 빠른 이동평균 기간 (기본값: 12)
- `slowPeriod`: 느린 이동평균 기간 (기본값: 26)
- `signalPeriod`: 시그널 기간 (기본값: 9)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "macd": 125.5,
    "signal": 98.2,
    "histogram": 27.3,
    "timestamp": 1706342400000,
    "trend": "bullish"
  }
}
```

### 3. 이동평균 (Moving Average)
```http
GET /api/technical/moving-average/{symbol}
```

**Query Parameters:**
- `period`: 이동평균 기간 (예: 20, 50, 200)
- `type`: 이동평균 타입 (sma, ema, wma)

### 4. 볼린저 밴드 (Bollinger Bands)
```http
GET /api/technical/bollinger-bands/{symbol}
```

**Query Parameters:**
- `period`: 이동평균 기간 (기본값: 20)
- `standardDeviation`: 표준편차 배수 (기본값: 2)

---

## 🤖 AI 추천 시스템 API

### 1. 단기 투자 추천 (1-7일)
```http
POST /api/recommendation/short-term
```

**Request Body:**
```json
{
  "symbols": ["BTCUSDT", "ETHUSDT"],
  "riskLevel": "moderate",
  "investmentAmount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "symbol": "BTCUSDT",
        "action": "buy",
        "confidence": 85,
        "targetPrice": "45000",
        "stopLoss": "41000",
        "reasoning": "RSI가 과매도 구간에서 반등 신호를 보이고 있습니다...",
        "riskLevel": "moderate",
        "timeframe": "3-5 days"
      }
    ],
    "marketAnalysis": "현재 시장은...",
    "generatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### 2. 중기 투자 추천 (1-4주)
```http
POST /api/recommendation/medium-term
```

### 3. 장기 투자 추천 (1-6개월)
```http
POST /api/recommendation/long-term
```

### 4. 기술적 분석 요청
```http
POST /api/ai/technical-analysis
```

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "indicators": ["rsi", "macd", "bollinger_bands"],
  "analysisType": "comprehensive"
}
```

---

## 📈 차트 데이터 API

### 1. OHLCV 데이터 조회
```http
GET /api/chart/ohlcv/{symbol}
```

**Query Parameters:**
- `timeframe`: 시간 프레임 (1m, 5m, 15m, 1h, 4h, 1d)
- `limit`: 데이터 개수 (최대 1000)
- `startTime`: 시작 시간 (Unix timestamp)
- `endTime`: 종료 시간 (Unix timestamp)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "timeframe": "1h",
    "candles": [
      {
        "timestamp": 1706342400000,
        "open": "43000.00",
        "high": "43200.00",
        "low": "42800.00",
        "close": "43100.00",
        "volume": "1500000000"
      }
    ]
  }
}
```

### 2. 사용자 차트 설정 저장
```http
POST /api/chart/settings
```

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "indicators": {
    "rsi": { "enabled": true, "period": 14 },
    "macd": { "enabled": true, "fastPeriod": 12, "slowPeriod": 26 },
    "bollingerBands": { "enabled": true, "period": 20 }
  },
  "layout": {
    "theme": "dark",
    "chartType": "candlestick"
  }
}
```

---

## 📰 뉴스 및 시장 정보 API

### 1. 최신 뉴스 조회
```http
GET /api/news/latest
```

**Query Parameters:**
- `limit`: 뉴스 개수 (기본값: 20)
- `category`: 뉴스 카테고리 (market, technology, regulation)

**Response:**
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "uuid",
        "title": "비트코인 ETF 승인으로 인한 시장 반응",
        "summary": "SEC의 비트코인 ETF 승인 이후...",
        "content": "전체 뉴스 내용...",
        "source": "CoinDesk",
        "url": "https://example.com/news",
        "publishedAt": "2025-01-27T10:00:00Z",
        "sentiment": "positive",
        "relevanceScore": 0.95
      }
    ],
    "totalCount": 20
  }
}
```

### 2. 특정 심볼 관련 뉴스
```http
GET /api/news/symbol/{symbol}
```

### 3. 시장 요약 정보
```http
GET /api/market/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMarketCap": "2500000000000",
    "totalVolume24h": "150000000000",
    "btcDominance": 52.5,
    "marketSentiment": "bullish",
    "topGainers": [
      {
        "symbol": "SOLUSDT",
        "change24h": 15.2,
        "price": "98.50"
      }
    ],
    "topLosers": [
      {
        "symbol": "ADAUSDT",
        "change24h": -8.5,
        "price": "0.45"
      }
    ]
  }
}
```

---

## 🔔 알림 시스템 API

### 1. 알림 설정 조회
```http
GET /api/notification/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "priceAlerts": [
      {
        "symbol": "BTCUSDT",
        "condition": "above",
        "price": "45000",
        "enabled": true
      }
    ],
    "newsAlerts": {
      "enabled": true,
      "categories": ["market", "regulation"]
    },
    "emailNotifications": {
      "enabled": true,
      "frequency": "daily"
    }
  }
}
```

### 2. 가격 알림 설정
```http
POST /api/notification/price-alert
```

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "condition": "above", // "above" | "below"
  "price": "45000",
  "enabled": true
}
```

### 3. 알림 목록 조회
```http
GET /api/notification/list
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 알림 개수 (기본값: 20)
- `type`: 알림 타입 (price, news, system)

---

## 🎛️ 대시보드 API

### 1. 사용자 대시보드 조회
```http
GET /api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "watchlist": [
      {
        "symbol": "BTCUSDT",
        "currentPrice": "43000",
        "change24h": "2.5",
        "addedAt": "2025-01-27T10:00:00Z"
      }
    ],
    "recentRecommendations": [
      {
        "symbol": "ETHUSDT",
        "action": "buy",
        "confidence": 80,
        "generatedAt": "2025-01-27T09:00:00Z"
      }
    ],
    "portfolioSummary": {
      "totalValue": "50000",
      "totalChange24h": "3.2",
      "bestPerformer": "BTCUSDT",
      "worstPerformer": "ADAUSDT"
    },
    "layoutSettings": {
      "theme": "dark",
      "defaultTimeframe": "1h",
      "chartLayout": "standard"
    }
  }
}
```

### 2. 관심 종목 추가
```http
POST /api/dashboard/watchlist
```

**Request Body:**
```json
{
  "symbol": "ETHUSDT"
}
```

### 3. 대시보드 설정 업데이트
```http
PUT /api/dashboard/settings
```

**Request Body:**
```json
{
  "theme": "dark",
  "defaultTimeframe": "4h",
  "chartLayout": "advanced",
  "notificationSettings": {
    "priceAlerts": true,
    "newsAlerts": true,
    "emailNotifications": true
  }
}
```

---

## 📡 실시간 통신 (WebSocket)

### WebSocket 연결
```
ws://localhost:3000/ws
```

### 1. 가격 실시간 구독
```json
{
  "type": "subscribe",
  "channel": "price",
  "symbols": ["BTCUSDT", "ETHUSDT"]
}
```

### 2. 차트 데이터 실시간 구독
```json
{
  "type": "subscribe",
  "channel": "chart",
  "symbol": "BTCUSDT",
  "timeframe": "1h"
}
```

### 3. 알림 실시간 구독
```json
{
  "type": "subscribe",
  "channel": "notifications"
}
```

### 실시간 데이터 예시
```json
{
  "type": "price_update",
  "data": {
    "symbol": "BTCUSDT",
    "price": "43050.00",
    "change24h": "2.6",
    "timestamp": 1706342400000
  }
}
```

---

## 📊 데이터 모델

### User Entity
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Entity
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'price' | 'news' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}
```

### Dashboard Entity
```typescript
interface Dashboard {
  id: string;
  userId: string;
  watchlist: WatchlistItem[];
  notificationSettings: NotificationSettings;
  layoutSettings: LayoutSettings;
  updatedAt: Date;
}
```

### Price Entity
```typescript
interface Price {
  symbol: string;
  price: string;
  timestamp: number;
  change24h?: string;
  volume24h?: string;
}
```

---

## ⚠️ 에러 처리

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "유효한 이메일 주소를 입력해주세요"
      }
    ]
  }
}
```

### 주요 에러 코드
- `VALIDATION_ERROR`: 입력 데이터 검증 실패
- `AUTHENTICATION_ERROR`: 인증 실패
- `AUTHORIZATION_ERROR`: 권한 부족
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `INTERNAL_ERROR`: 서버 내부 오류
- `EXTERNAL_API_ERROR`: 외부 API 호출 실패

---

## 🚀 개발 환경 설정

### 필수 요구사항
- Node.js 18.x+
- PostgreSQL 15+
- Redis 7.x
- npm 또는 yarn

### 환경 변수 설정 (.env)
```bash
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=crypto_tracker_pro
DB_SYNCHRONIZE=true
DB_LOGGING=true

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google AI 설정
GOOGLE_AI_API_KEY=your_google_ai_key
GOOGLE_AI_MODEL=gemini-1.5-flash

# Binance API 설정
BINANCE_API_KEY=your_binance_key
BINANCE_SECRET_KEY=your_binance_secret

# CORS 설정
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npm run migration:run

# 개발 서버 실행
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

---

## 🌐 배포 정보

### 개발 환경
- **URL**: http://localhost:3000
- **API 문서**: http://localhost:3000/api-docs
- **데이터베이스**: PostgreSQL (로컬)
- **캐시**: Redis (로컬)

### 프로덕션 환경
- **URL**: https://your-domain.com
- **API 문서**: https://your-domain.com/api-docs
- **데이터베이스**: PostgreSQL (클라우드)
- **캐시**: Redis (클라우드)

### 헬스 체크
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T10:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "binance": "connected",
    "googleAI": "connected"
  }
}
```

---

## 📚 추가 리소스

### API 테스트
- **Postman Collection**: 프로젝트 루트의 `postman_collection.json`
- **Insomnia**: 프로젝트 루트의 `insomnia_collection.json`

### 개발 가이드
- **NestJS 공식 문서**: https://docs.nestjs.com/
- **TypeORM 문서**: https://typeorm.io/
- **Swagger 문서**: http://localhost:3000/api-docs

### 지원 및 문의
- **개발팀**: dev@cryptotracker.com
- **기술 문서**: https://docs.cryptotracker.com
- **GitHub**: https://github.com/your-org/crypto-tracker-pro

---

## 🔄 API 버전 관리

현재 API는 **v1**을 사용합니다. 향후 호환성을 위해 버전 관리가 필요할 경우:

```http
GET /api/v1/price/BTCUSDT
POST /api/v2/recommendation/short-term
```

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2025-01-27 | 초기 API 명세서 작성 |
| 1.1.0 | 2025-01-27 | 사용자 관리 시스템 추가 |
| 1.2.0 | 2025-01-27 | 알림 및 대시보드 시스템 추가 |

---

**마지막 업데이트**: 2025년 1월 27일  
**문서 버전**: 1.2.0  
**작성자**: 개발팀

