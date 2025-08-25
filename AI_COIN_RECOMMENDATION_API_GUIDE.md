# 🤖 AI 코인 추천 API 개발 가이드

## 📋 개요

AI 기반 암호화폐 추천 API는 단기(1-7일), 중기(1-4주), 장기(1-12개월) 투자 전략에 맞는 TOP 3 코인을 추천합니다. 각 추천에는 상세한 근거와 분석이 포함됩니다.

---

## 🚀 API 엔드포인트

### Base URL
```
http://localhost:3000
```

### 1. 단기 추천 코인 조회 (1-7일)
```http
GET /recommendations/short-term
```

### 2. 중기 추천 코인 조회 (1-4주)
```http
GET /recommendations/medium-term
```

### 3. 장기 추천 코인 조회 (1-12개월)
```http
GET /recommendations/long-term
```

### 4. 모든 타임프레임 추천 조회
```http
GET /recommendations/all
```

---

## 📊 응답 데이터 구조

### 단일 타임프레임 응답
```typescript
interface CoinRecommendationResponse {
  result: boolean;
  msg: string;
  result_data: {
    timeframe: 'short_term' | 'medium_term' | 'long_term';
    timeframeDescription: string;
    recommendations: RecommendedCoin[];
    generatedAt: string;
    modelInfo: string;
    marketAnalysis: string;
  };
  code: string;
}
```

### 모든 타임프레임 응답
```typescript
interface AllRecommendationsResponse {
  result: boolean;
  msg: string;
  result_data: {
    shortTerm: CoinRecommendationResponse;
    mediumTerm: CoinRecommendationResponse;
    longTerm: CoinRecommendationResponse;
    overallMarketStatus: string;
    generatedAt: string;
  };
  code: string;
}
```

### 추천 코인 데이터 구조
```typescript
interface RecommendedCoin {
  symbol: string;           // 코인 심볼 (예: BTCUSDT)
  name: string;             // 코인 이름 (예: Bitcoin)
  currentPrice: number;     // 현재 가격
  change24h: number;        // 24시간 변동률 (%)
  expectedReturn: number;   // 예상 수익률 (%)
  riskScore: number;        // 위험도 점수 (1-10, 1이 가장 안전)
  recommendationScore: number; // 추천 점수 (0-100)
  reasons: RecommendationReason[]; // 추천 근거들
  analysis: string;         // AI 분석 요약
  targetPrice: number;      // 목표 가격
  stopLoss: number;         // 손절가
}
```

### 추천 근거 데이터 구조
```typescript
interface RecommendationReason {
  type: RecommendationReasonType;
  description: string;
  confidence: number;       // 신뢰도 점수 (0-100)
  data?: string;           // 관련 데이터
}

enum RecommendationReasonType {
  TECHNICAL_BREAKOUT = 'technical_breakout',           // 기술적 돌파
  FUNDAMENTAL_STRENGTH = 'fundamental_strength',       // 기본적 강점
  MARKET_SENTIMENT = 'market_sentiment',               // 시장 심리
  VOLUME_SPIKE = 'volume_spike',                       // 거래량 급증
  NEWS_POSITIVE = 'news_positive',                     // 긍정적 뉴스
  INSTITUTIONAL_INTEREST = 'institutional_interest',   // 기관 관심
  ECOSYSTEM_GROWTH = 'ecosystem_growth',               // 생태계 성장
  REGULATORY_CLARITY = 'regulatory_clarity'            // 규제 명확성
}
```

---

## 💻 클라이언트 구현 예시

### JavaScript/TypeScript
```typescript
class CoinRecommendationAPI {
  private baseUrl = 'http://localhost:3000';

  // 단기 추천 조회
  async getShortTermRecommendations() {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/short-term`);
      const data = await response.json();
      return data.result_data;
    } catch (error) {
      console.error('단기 추천 조회 실패:', error);
      throw error;
    }
  }

  // 중기 추천 조회
  async getMediumTermRecommendations() {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/medium-term`);
      const data = await response.json();
      return data.result_data;
    } catch (error) {
      console.error('중기 추천 조회 실패:', error);
      throw error;
    }
  }

  // 장기 추천 조회
  async getLongTermRecommendations() {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/long-term`);
      const data = await response.json();
      return data.result_data;
    } catch (error) {
      console.error('장기 추천 조회 실패:', error);
      throw error;
    }
  }

  // 모든 추천 조회
  async getAllRecommendations() {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/all`);
      const data = await response.json();
      return data.result_data;
    } catch (error) {
      console.error('모든 추천 조회 실패:', error);
      throw error;
    }
  }
}
```

### React Hook 예시
```typescript
import { useState, useEffect } from 'react';

interface UseRecommendationsOptions {
  timeframe?: 'short-term' | 'medium-term' | 'long-term' | 'all';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRecommendations(options: UseRecommendationsOptions = {}) {
  const { timeframe = 'all', autoRefresh = false, refreshInterval = 300000 } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const api = new CoinRecommendationAPI();
      let result;
      
      switch (timeframe) {
        case 'short-term':
          result = await api.getShortTermRecommendations();
          break;
        case 'medium-term':
          result = await api.getMediumTermRecommendations();
          break;
        case 'long-term':
          result = await api.getLongTermRecommendations();
          break;
        default:
          result = await api.getAllRecommendations();
      }
      
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    
    if (autoRefresh) {
      const interval = setInterval(fetchRecommendations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timeframe, autoRefresh, refreshInterval]);

  return { data, loading, error, refetch: fetchRecommendations };
}
```

### React 컴포넌트 예시
```tsx
import React from 'react';
import { useRecommendations } from './hooks/useRecommendations';

const RecommendationCard: React.FC<{ coin: RecommendedCoin }> = ({ coin }) => (
  <div className="recommendation-card">
    <div className="coin-header">
      <h3>{coin.name} ({coin.symbol})</h3>
      <span className={`change ${coin.change24h >= 0 ? 'positive' : 'negative'}`}>
        {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
      </span>
    </div>
    
    <div className="coin-details">
      <p>현재가: ${coin.currentPrice.toLocaleString()}</p>
      <p>예상 수익률: {coin.expectedReturn}%</p>
      <p>위험도: {coin.riskScore}/10</p>
      <p>추천 점수: {coin.recommendationScore}/100</p>
    </div>
    
    <div className="target-prices">
      <p>목표가: ${coin.targetPrice.toLocaleString()}</p>
      <p>손절가: ${coin.stopLoss.toLocaleString()}</p>
    </div>
    
    <div className="reasons">
      <h4>추천 근거:</h4>
      {coin.reasons.map((reason, index) => (
        <div key={index} className="reason">
          <span className="reason-type">{reason.type}</span>
          <p>{reason.description}</p>
          <span className="confidence">신뢰도: {reason.confidence}%</span>
        </div>
      ))}
    </div>
    
    <div className="analysis">
      <h4>AI 분석:</h4>
      <p>{coin.analysis}</p>
    </div>
  </div>
);

const RecommendationsPage: React.FC = () => {
  const { data, loading, error } = useRecommendations({ 
    timeframe: 'all', 
    autoRefresh: true 
  });

  if (loading) return <div>추천 데이터를 불러오는 중...</div>;
  if (error) return <div>오류가 발생했습니다: {error.message}</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div className="recommendations-page">
      <h1>AI 코인 추천</h1>
      
      <section className="short-term">
        <h2>단기 추천 (1-7일)</h2>
        <div className="recommendations-grid">
          {data.shortTerm.recommendations.map((coin, index) => (
            <RecommendationCard key={index} coin={coin} />
          ))}
        </div>
      </section>
      
      <section className="medium-term">
        <h2>중기 추천 (1-4주)</h2>
        <div className="recommendations-grid">
          {data.mediumTerm.recommendations.map((coin, index) => (
            <RecommendationCard key={index} coin={coin} />
          ))}
        </div>
      </section>
      
      <section className="long-term">
        <h2>장기 추천 (1-12개월)</h2>
        <div className="recommendations-grid">
          {data.longTerm.recommendations.map((coin, index) => (
            <RecommendationCard key={index} coin={coin} />
          ))}
        </div>
      </section>
    </div>
  );
};
```

---

## 🎨 UI/UX 권장사항

### 1. 시각적 계층구조
- **타임프레임별 구분**: 단기/중기/장기를 명확히 구분
- **위험도 표시**: 색상 코딩으로 위험도 시각화 (녹색: 안전, 노란색: 보통, 빨간색: 위험)
- **추천 점수**: 게이지나 프로그레스 바로 표시

### 2. 정보 표시
- **핵심 정보**: 현재가, 변동률, 예상 수익률을 상단에 배치
- **추천 근거**: 접을 수 있는 섹션으로 상세 정보 제공
- **목표가/손절가**: 명확한 시각적 구분

### 3. 인터랙션
- **자동 새로고침**: 5분마다 자동 업데이트
- **수동 새로고침**: 사용자가 원할 때 업데이트
- **필터링**: 위험도, 추천 점수별 필터링

---

## 🔧 에러 처리

### 일반적인 에러 상황
```typescript
// 네트워크 에러
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

// API 에러
if (!data.result) {
  throw new Error(data.msg || '알 수 없는 오류가 발생했습니다.');
}

// 데이터 없음
if (!data.result_data || !data.result_data.recommendations) {
  throw new Error('추천 데이터를 찾을 수 없습니다.');
}
```

### 재시도 로직
```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 📱 모바일 최적화

### 반응형 디자인
```css
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-card {
    margin-bottom: 1rem;
  }
}
```

### 터치 친화적 인터페이스
- 충분한 터치 영역 (최소 44px)
- 스와이프 제스처 지원
- 로딩 상태 표시

---

## 🔒 보안 고려사항

### 1. API 키 관리
```typescript
// 환경 변수 사용
const API_KEY = process.env.REACT_APP_API_KEY;

// 헤더에 인증 정보 추가
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};
```

### 2. 요청 제한
- 적절한 요청 간격 유지
- 캐싱 활용으로 불필요한 요청 방지

### 3. 데이터 검증
```typescript
function validateRecommendationData(data: any): boolean {
  return (
    data &&
    Array.isArray(data.recommendations) &&
    data.recommendations.length > 0 &&
    data.recommendations.every(coin => 
      coin.symbol && 
      coin.currentPrice && 
      coin.recommendationScore >= 0 && 
      coin.recommendationScore <= 100
    )
  );
}
```

---

## 🚀 성능 최적화

### 1. 캐싱 전략
```typescript
class RecommendationCache {
  private cache = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5분

  async get(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

### 2. 지연 로딩
```typescript
// 필요한 시점에만 데이터 로드
const { data: shortTerm } = useRecommendations({ timeframe: 'short-term' });
const { data: mediumTerm } = useRecommendations({ timeframe: 'medium-term' });
const { data: longTerm } = useRecommendations({ timeframe: 'long-term' });
```

### 3. 가상화 (대량 데이터)
```tsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedRecommendations = ({ recommendations }) => (
  <List
    height={600}
    itemCount={recommendations.length}
    itemSize={200}
    itemData={recommendations}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <RecommendationCard coin={data[index]} />
      </div>
    )}
  </List>
);
```

---

## 📊 모니터링 및 분석

### 1. 사용자 행동 추적
```typescript
// 추천 클릭 추적
function trackRecommendationClick(coin: RecommendedCoin, timeframe: string) {
  analytics.track('recommendation_clicked', {
    coin: coin.symbol,
    timeframe,
    recommendationScore: coin.recommendationScore,
    riskScore: coin.riskScore
  });
}
```

### 2. 성능 모니터링
```typescript
// API 응답 시간 측정
async function measureAPIPerformance(endpoint: string) {
  const start = performance.now();
  try {
    await fetch(endpoint);
    const duration = performance.now() - start;
    analytics.track('api_performance', { endpoint, duration });
  } catch (error) {
    analytics.track('api_error', { endpoint, error: error.message });
  }
}
```

---

## 🔄 업데이트 및 유지보수

### 1. 버전 관리
```typescript
// API 버전 확인
const API_VERSION = 'v1';
const BASE_URL = `http://localhost:3000/api/${API_VERSION}`;
```

### 2. 기능 플래그
```typescript
const FEATURES = {
  AUTO_REFRESH: process.env.REACT_APP_AUTO_REFRESH === 'true',
  ADVANCED_ANALYSIS: process.env.REACT_APP_ADVANCED_ANALYSIS === 'true'
};
```

---

## 📞 지원 및 문의

### 기술 지원
- **이메일**: dev@cryptotracker.com
- **문서**: https://docs.cryptotracker.com
- **GitHub**: https://github.com/cryptotracker/api

### 문제 해결
1. **CORS 에러**: 서버 CORS 설정 확인
2. **네트워크 타임아웃**: 요청 간격 조정
3. **데이터 누락**: API 응답 구조 확인

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|-----------|
| 1.0.0 | 2025-01-23 | 초기 버전 릴리즈 |
| 1.1.0 | 2025-01-24 | 추천 근거 상세화 |
| 1.2.0 | 2025-01-25 | 위험도 점수 추가 |

---

**🎯 이 가이드를 참고하여 AI 코인 추천 API를 성공적으로 구현하세요!**




