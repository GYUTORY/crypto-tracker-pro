# Price Controllers - 가격 관련 컨트롤러

암호화폐 가격 조회 및 차트 데이터 관련 API 엔드포인트를 제공합니다.

## 포함된 컨트롤러

### 1. PriceController
- **파일**: `price.controller.ts`
- **기능**: 실시간 암호화폐 가격 데이터 제공
- **엔드포인트**:
  - `GET /price/:symbol` - 가격 조회
  - `GET /price/:symbol/chart` - 차트 데이터 조회
- **특징**: 
  - 메모리 캐시 우선 조회 전략
  - 바이낸스 API 폴백 메커니즘
  - 강제 새로고침 옵션
  - 자동 데이터 소스 관리

## API 사용 예시

```bash
# 기본 가격 조회 (캐시 우선)
GET /price/BTCUSDT

# 강제 새로고침 (API에서 최신 데이터 조회)
GET /price/BTCUSDT?forceRefresh=true

# 차트 데이터 조회
GET /price/BTCUSDT/chart?timeframe=1h&limit=100
```

## 응답 예시

```json
{
  "result": true,
  "msg": "메모리에서 BTCUSDT 가격 조회 완료",
  "result_data": {
    "symbol": "BTCUSDT",
    "price": "43250.50",
    "source": "memory",
    "age": 5000,
    "change": "+2.5%",
    "changePercent": 2.5,
    "volume24h": "1.2B",
    "high24h": "43500.00",
    "low24h": "42000.00",
    "marketCap": "850B",
    "timestamp": 1640995200000
  }
}
```
