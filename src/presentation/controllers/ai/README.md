# AI Controllers - AI 분석 관련 컨트롤러

AI 기반 기술적 분석 및 예측 관련 API 엔드포인트를 제공합니다.

## 포함된 컨트롤러

### 1. AiController
- **파일**: `ai.controller.ts`
- **기능**: Google Gemini AI를 활용한 암호화폐 기술적 분석
- **엔드포인트**:
  - `POST /ai/technical-analysis` - 기술적 분석 수행
- **특징**: 
  - 실시간 가격 데이터 기반 분석
  - AI 기반 매매 신호 제공
  - 위험도 평가 및 추천
  - 상세한 기술적 지표 분석

## API 사용 예시

```bash
# 기술적 분석 요청
curl -X POST http://localhost:3000/ai/technical-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT"}'
```

## 요청 예시

```json
{
  "symbol": "BTCUSDT"
}
```

## 응답 예시

```json
{
  "result": true,
  "msg": "AI 기술적 분석 완료",
  "result_data": {
    "symbol": "BTCUSDT",
    "currentPrice": "43250.50",
    "analysis": {
      "rsi": {
        "value": 65.5,
        "status": "중립",
        "description": "RSI가 중립 구간에 위치"
      },
      "macd": {
        "signal": "매수",
        "description": "MACD가 상승 신호를 보임"
      },
      "recommendation": "매수",
      "confidence": 75,
      "riskLevel": "보통",
      "keyFactors": [
        "RSI 중립 구간",
        "MACD 상승 신호",
        "볼린저 밴드 중간선 접근"
      ]
    }
  }
}
```
