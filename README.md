# Crypto Tracker Pro

비트코인 바이낸스 실시간 가격 추적을 위한 NestJS 프로젝트입니다.
바이낸스 WebSocket 스트림에 직접 연결하여 실시간 가격 데이터를 받아 메모리에 저장하고, API를 통해 빠르게 제공합니다.

## 주요 기능

- **바이낸스 WebSocket 연결**: 실시간 비트코인 가격 데이터 수신
- **메모리 기반 저장소**: 빠른 가격 데이터 조회
- **REST API**: HTTP를 통한 가격 데이터 제공
- **폴백 시스템**: 메모리에 없으면 바이낸스 API 호출
- **통일된 응답 형식**: 모든 API가 BaseResponse 형태로 응답

## 기술 스택

- **Node.js**: 22.x
- **NestJS**: 10.x
- **TypeScript**: 5.x
- **WebSocket**: ws 라이브러리
- **HTTP Client**: axios

## 설치 및 실행

### 1. Node.js 버전 확인
```bash
node --version  # 22.x 이상이어야 합니다
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run start:dev
```

### 4. 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## 프로젝트 구조

```
src/
├── main.ts                 # 애플리케이션 진입점
├── app.module.ts          # 루트 모듈
├── app.controller.ts      # 기본 컨트롤러
├── app.service.ts         # 기본 서비스
├── services/              # 공통 서비스
│   └── base.service.ts    # BaseService (모든 서비스의 기본 클래스)
├── tcp/                   # WebSocket 연결 관련 모듈
│   ├── tcp.module.ts      # TCP 모듈
│   ├── tcp.service.ts     # 바이낸스 WebSocket 연결 서비스
│   └── price-store.service.ts # 메모리 기반 가격 저장소
└── binance/               # 바이낸스 가격 데이터 모듈
    ├── binance.module.ts
    ├── binance.controller.ts
    └── binance.service.ts
```

## 데이터 흐름

1. **바이낸스 WebSocket** → **WebSocket 클라이언트** → **메모리 저장소**
2. **API 요청** → **메모리 조회** → **BaseResponse 형태로 응답**
3. **메모리에 없으면** → **바이낸스 API 호출** → **메모리 저장** → **응답**

## API 응답 형식

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

## API 엔드포인트

### 기본 엔드포인트
- `GET /` - 환영 메시지
- `GET /health` - 헬스체크

### 바이낸스 WebSocket 연결 상태
- `GET /tcp/status` - 바이낸스 WebSocket 연결 상태 및 메모리 정보
- `GET /tcp/prices` - 메모리에 저장된 모든 가격 데이터

### 바이낸스 가격 데이터
- `GET /binance/price/:symbol` - 특정 암호화폐 현재 가격

## 바이낸스 WebSocket 연결

### 연결 정보
- **URL**: wss://stream.binance.com:9443/ws
- **구독 스트림**: btcusdt@ticker, ethusdt@ticker, btcusdt@trade, ethusdt@trade

### 자동 연결
- 서버 시작 시 자동으로 바이낸스 WebSocket 스트림에 연결
- 연결 끊어지면 5초 후 자동 재연결
- 실시간 가격 데이터를 메모리에 자동 저장

## BaseService 구조

모든 서비스는 `BaseService`를 상속받아 일관된 응답 형식을 제공합니다:

```typescript
// 성공 응답 생성
this.createSuccessResponse(data, message, httpStatus);

// 실패 응답 생성
this.createErrorResponse(message, httpStatus, data);

// 데이터 없음 응답 생성
this.createNoDataResponse(message);

// 서버 오류 응답 생성
this.createInternalErrorResponse(message, data);
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 서버 포트
PORT=3000

# 바이낸스 API (폴백용)
BINANCE_API_URL=https://api.binance.com/api/v3
```

## 개발 도구

- **코드 포맷팅**: `npm run format`
- **린팅**: `npm run lint`
- **테스트**: `npm run test`
- **테스트 커버리지**: `npm run test:cov`

## 사용 예시

### 1. API로 가격 데이터 조회
```bash
curl http://localhost:3000/binance/price/BTCUSDT
```

**응답 예시:**
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

### 2. 바이낸스 WebSocket 연결 상태 확인
```bash
curl http://localhost:3000/tcp/status
```

### 3. 메모리 데이터 조회
```bash
curl http://localhost:3000/tcp/prices
```

### 4. 전체 API 테스트
```bash
chmod +x api-test.sh
./api-test.sh
```

## 성능 특징

- **빠른 응답**: 메모리 기반 조회로 밀리초 단위 응답
- **실시간 데이터**: WebSocket을 통한 실시간 가격 업데이트
- **폴백 지원**: 메모리에 없으면 바이낸스 API 자동 호출
- **데이터 유효성**: 30초 자동 만료로 오래된 데이터 제거
- **일관된 응답**: 모든 API가 동일한 BaseResponse 형태로 응답
- **HTTP 상태 코드**: 적절한 HTTP 상태 코드와 함께 응답

## 에러 처리

- **400 Bad Request**: 잘못된 요청 (잘못된 심볼 등)
- **404 Not Found**: 데이터를 찾을 수 없음
- **500 Internal Server Error**: 서버 내부 오류

모든 에러 응답도 BaseResponse 형태로 반환됩니다:

```json
{
  "result": false,
  "msg": "Error message",
  "result_data": null,
  "httpStatus": 400
}
``` 