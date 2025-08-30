# Price Use Cases - 가격 관련 유스케이스

암호화폐 가격 조회 및 OHLCV 데이터 관련 기능들을 제공합니다.

## 포함된 유스케이스

### 1. GetPriceUseCase
- **파일**: `get-price.use-case.ts`
- **기능**: 암호화폐의 현재 가격을 조회
- **특징**: 
  - 메모리 캐시 우선 조회 전략
  - 바이낸스 API 폴백 메커니즘
  - 24시간 통계 데이터 통합 제공
  - 자동 데이터 갱신 및 백그라운드 업데이트

### 2. GetOhlcvDataUseCase
- **파일**: `get-ohlcv-data.use-case.ts`
- **기능**: OHLCV(Open, High, Low, Close, Volume) 데이터 조회
- **특징**:
  - 다양한 시간대 지원 (1m, 5m, 15m, 1h, 4h, 1d 등)
  - 캐시 기반 성능 최적화
  - 기술적 분석을 위한 기본 데이터 제공

## 사용 예시

```typescript
// 가격 조회
const priceUseCase = new GetPriceUseCase(priceRepo, binanceRepo);
const price = await priceUseCase.execute({ symbol: 'BTCUSDT' });

// OHLCV 데이터 조회
const ohlcvUseCase = new GetOhlcvDataUseCase(binanceRepo);
const ohlcv = await ohlcvUseCase.execute({ 
  symbol: 'BTCUSDT', 
  interval: '1h',
  limit: 100 
});
```
