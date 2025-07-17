# Crypto Tracker Pro API - cURL 명령어 가이드

이 문서는 Crypto Tracker Pro API의 각 엔드포인트를 테스트하기 위한 cURL 명령어들을 제공합니다.

## 📋 응답 형식

모든 API 응답은 다음과 같은 BaseResponse 형태로 반환됩니다:

```json
{
  "result": true,
  "msg": "성공 메시지",
  "result_data": {
    // 실제 데이터
  },
  "httpStatus": 200
}
```

- `result`: 요청 성공 여부 (true/false)
- `msg`: 응답 메시지
- `result_data`: 실제 데이터
- `httpStatus`: HTTP 상태 코드

## 🚀 기본 엔드포인트

### 1. 기본 환영 메시지
```bash
curl http://localhost:3000/
```

**응답 예시:**
```json
{
  "result": true,
  "msg": "Welcome message retrieved successfully",
  "result_data": "Welcome to Crypto Tracker Pro! 🚀",
  "httpStatus": 200
}
```

### 2. 헬스 체크
```bash
curl http://localhost:3000/health
```

**응답 예시:**
```json
{
  "result": true,
  "msg": "Health check successful",
  "result_data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "httpStatus": 200
}
```

## 🔗 바이낸스 WebSocket 연결 상태

### 3. 연결 상태 확인
```bash
curl http://localhost:3000/tcp/status
```

**응답 예시:**
```json
{
  "result": true,
  "msg": "TCP status retrieved successfully",
  "result_data": {
    "connection": {
      "isConnected": true,
      "url": "wss://stream.binance.com:9443/ws",
      "lastUpdate": "2024-01-15T10:30:00.000Z"
    },
    "memory": {
      "priceCount": 2,
      "symbols": ["BTCUSDT", "ETHUSDT"],
      "validityDuration": 30000
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "httpStatus": 200
}
```

### 4. 메모리 저장된 모든 가격 데이터
```bash
curl http://localhost:3000/tcp/prices
```

**응답 예시:**
```json
{
  "result": true,
  "msg": "All prices retrieved successfully",
  "result_data": {
    "prices": [
      {
        "symbol": "BTCUSDT",
        "price": "43250.50",
        "timestamp": 1705312200000,
        "volume": "1234.56",
        "changePercent24h": "2.5"
      },
      {
        "symbol": "ETHUSDT",
        "price": "2650.75",
        "timestamp": 1705312200000,
        "volume": "5678.90",
        "changePercent24h": "1.8"
      }
    ],
    "count": 2,
    "symbols": ["BTCUSDT", "ETHUSDT"],
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "httpStatus": 200
}
```

## 💰 암호화폐 가격 조회

### 5. 비트코인 가격 조회
```bash
curl http://localhost:3000/binance/price/BTCUSDT
```

**성공 응답 예시:**
```json
{
  "result": true,
  "msg": "Price retrieved from memory for BTCUSDT",
  "result_data": {
    "symbol": "BTCUSDT",
    "price": "43250.50"
  },
  "httpStatus": 200
}
```

### 6. 이더리움 가격 조회
```bash
curl http://localhost:3000/binance/price/ETHUSDT
```

**성공 응답 예시:**
```json
{
  "result": true,
  "msg": "Price retrieved from API for ETHUSDT",
  "result_data": {
    "symbol": "ETHUSDT",
    "price": "2650.75"
  },
  "httpStatus": 200
}
```

### 7. 잘못된 심볼 테스트 (에러 처리)
```bash
curl http://localhost:3000/binance/price/INVALID
```

**에러 응답 예시:**
```json
{
  "result": false,
  "msg": "Invalid symbol: INVALID",
  "result_data": null,
  "httpStatus": 400
}
```

## 🔧 고급 테스트

### 8. HTTP 상태 코드 확인
```bash
curl -i http://localhost:3000/health
```

### 9. JSON 형식으로 보기 좋게 출력
```bash
curl -s http://localhost:3000/tcp/status | jq '.'
```

### 10. 특정 필드만 추출
```bash
# 연결 상태만 확인
curl -s http://localhost:3000/tcp/status | jq '.result_data.connection.isConnected'

# 가격 개수만 확인
curl -s http://localhost:3000/tcp/prices | jq '.result_data.count'
```

## 📊 응답 상태별 예시

### 성공 응답
```json
{
  "result": true,
  "msg": "Operation completed successfully",
  "result_data": { /* 데이터 */ },
  "httpStatus": 200
}
```

### 실패 응답
```json
{
  "result": false,
  "msg": "Error message",
  "result_data": null,
  "httpStatus": 400
}
```

### 데이터 없음 응답
```json
{
  "result": true,
  "msg": "No data found",
  "result_data": null,
  "httpStatus": 200
}
```

## 🚨 주의사항

1. **서버 실행**: API 테스트 전에 서버가 실행 중인지 확인하세요.
2. **포트 확인**: 기본 포트는 3000입니다. 다른 포트를 사용하는 경우 URL을 수정하세요.
3. **심볼 형식**: 암호화폐 심볼은 대문자로 입력하세요 (예: BTCUSDT, ETHUSDT).
4. **실시간 데이터**: 바이낸스 WebSocket 연결이 활성화되어 있어야 실시간 데이터를 받을 수 있습니다.

## 🛠️ 문제 해결

### 서버가 응답하지 않는 경우
```bash
# 서버 상태 확인
curl -v http://localhost:3000/health

# 포트 사용 확인
lsof -i :3000
```

### JSON 파싱 오류가 발생하는 경우
```bash
# jq 설치 (macOS)
brew install jq

# jq 설치 (Ubuntu/Debian)
sudo apt-get install jq
``` 