# Technical Analysis Use Cases - 기술적 분석 유스케이스

암호화폐 기술적 지표 분석 및 AI 기반 분석 기능들을 제공합니다.

## 포함된 유스케이스

### 1. AnalyzeTechnicalUseCase
- **파일**: `analyze-technical.use-case.ts`
- **기능**: 종합적인 기술적 분석 수행
- **특징**: 
  - 여러 기술적 지표를 종합하여 분석
  - AI 기반 해석 및 추천 제공

### 2. AnalyzeTechnicalSimpleUseCase
- **파일**: `analyze-technical-simple.use-case.ts`
- **기능**: 간단한 기술적 분석 수행
- **특징**:
  - 빠른 분석을 위한 간소화된 버전
  - 기본적인 기술적 지표만 사용

### 3. GetMovingAverageIndicatorUseCase
- **파일**: `get-moving-average-indicator.use-case.ts`
- **기능**: 이동평균 지표 계산
- **특징**:
  - SMA, EMA, WMA 등 다양한 이동평균 지원
  - 다양한 기간 설정 가능

### 4. GetBollingerBandsIndicatorUseCase
- **파일**: `get-bollinger-bands-indicator.use-case.ts`
- **기능**: 볼린저 밴드 지표 계산
- **특징**:
  - 상단, 중간, 하단 밴드 계산
  - 변동성 기반 분석 제공

### 5. GetMacdIndicatorUseCase
- **파일**: `get-macd-indicator.use-case.ts`
- **기능**: MACD 지표 계산
- **특징**:
  - MACD 라인, 시그널 라인, 히스토그램 계산
  - 추세 분석에 활용

### 6. GetRsiIndicatorUseCase
- **파일**: `get-rsi-indicator.use-case.ts`
- **기능**: RSI(상대강도지수) 계산
- **특징**:
  - 과매수/과매도 구간 판단
  - 모멘텀 분석에 활용

## 사용 예시

```typescript
// 종합 기술적 분석
const analysisUseCase = new AnalyzeTechnicalUseCase(aiRepo, binanceRepo);
const analysis = await analysisUseCase.execute({ symbol: 'BTCUSDT' });

// RSI 지표 계산
const rsiUseCase = new GetRsiIndicatorUseCase(binanceRepo);
const rsi = await rsiUseCase.execute({ 
  symbol: 'BTCUSDT', 
  period: 14,
  interval: '1h' 
});
```
