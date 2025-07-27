# Crypto Tracker Pro

비트코인 실시간 가격 추적 NestJS 프로젝트

## 주요 기능

- 바이낸스 WebSocket 연결
- 메모리 기반 저장소
- REST API
- 폴백 시스템
- Swagger 문서화

## 기술 스택

- Node.js: 22.x
- NestJS: 10.x
- TypeScript: 5.x
- WebSocket: ws 라이브러리
- HTTP Client: axios
- API 문서화: Swagger/OpenAPI

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

## API 문서 (Swagger)

### Swagger UI 접속
서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **개발 환경**: http://localhost:3000/api-docs
- **프로덕션 환경**: https://your-domain.com/api-docs

### API 문서 특징
- API 스키마 정의
- 실시간 테스트 가능
- 상세한 설명 제공
- 응답 코드 예시
- 인터랙티브 UI

### API 태그별 분류
1. health: 헬스체크 및 기본 정보
   - `GET /` - 환영 메시지
   - `GET /health` - 헬스체크

2. binance: 바이낸스 가격 데이터 API
   - `GET /binance/price/:symbol` - 특정 암호화폐 현재 가격

3. tcp: WebSocket 연결 상태 및 메모리 데이터
   - `GET /tcp/status` - WebSocket 연결 상태 및 메모리 정보
   - `GET /tcp/prices` - 메모리 저장된 모든 가격 데이터
   - `GET /tcp/reconnect` - WebSocket 재연결 시도

## 프로젝트 구조

```
src/
├── main.ts                 # 애플리케이션 진입점 (Swagger 설정 포함)
├── app.module.ts          # 루트 모듈
├── app.controller.ts      # 기본 컨트롤러 (헬스체크)
├── app.service.ts         # 기본 서비스
├── dto/                   # Data Transfer Objects (Swagger 스키마)
│   ├── base-response.dto.ts    # 공통 응답 DTO
│   ├── price.dto.ts            # 가격 데이터 DTO
│   └── health.dto.ts           # 헬스체크 DTO
├── services/              # 공통 서비스
│   └── base.service.ts    # BaseService (모든 서비스의 기본 클래스)
├── tcp/                   # WebSocket 연결 관련 모듈
│   ├── tcp.module.ts      # TCP 모듈
│   ├── tcp.controller.ts  # TCP 컨트롤러 (WebSocket 상태 관리)
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
  "code": "S001"
}
```

- `result`: 요청 성공 여부 (true/false)
- `msg`: 응답 메시지
- `result_data`: 실제 데이터
- `code`: 응답 코드 (S001: 성공, E001: 일반 오류, E400: 잘못된 요청, E500: 서버 오류)

## API 엔드포인트

### 기본 엔드포인트
- `GET /` - 환영 메시지
- `GET /health` - 헬스체크

### 바이낸스 WebSocket 연결 상태
- `GET /tcp/status` - 바이낸스 WebSocket 연결 상태 및 메모리 정보
- `GET /tcp/prices` - 메모리에 저장된 모든 가격 데이터
- `GET /tcp/reconnect` - WebSocket 재연결 시도

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
this.success(data, message, code);

// 실패 응답 생성
this.false(message, code, data);

// 데이터 없음 응답 생성
this.createNoDataResponse(message);

// 서버 오류 응답 생성
this.fail(message, data);
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
- **API 문서**: http://localhost:3000/api-docs

## 사용 예시

### 1. Swagger UI를 통한 API 테스트
1. 브라우저에서 http://localhost:3000/api-docs 접속
2. 원하는 API 엔드포인트 선택
3. "Try it out" 버튼 클릭
4. 파라미터 입력 후 "Execute" 버튼 클릭
5. 실시간으로 API 응답 확인

### 2. API로 가격 데이터 조회
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
  "code": "S001"
}
```

### 3. 바이낸스 WebSocket 연결 상태 확인
```bash
curl http://localhost:3000/tcp/status
```

### 4. 메모리 데이터 조회
```bash
curl http://localhost:3000/tcp/prices
```

### 5. 전체 API 테스트
```bash
chmod +x api-test.sh
./api-test.sh
```

## 성능 특징

- 메모리 기반 빠른 조회
- 실시간 데이터 업데이트
- 폴백 시스템
- 데이터 유효성 관리
- 일관된 응답 형식

## 에러 처리

- 400 Bad Request: 잘못된 요청 (잘못된 심볼 등)
- 404 Not Found: 데이터를 찾을 수 없음
- 500 Internal Server Error: 서버 내부 오류

모든 에러 응답도 BaseResponse 형태로 반환됩니다:

```json
{
  "result": false,
  "msg": "Error message",
  "result_data": null,
  "code": "E400"
}
```

## Swagger 문서화 특징

- API 스키마 정의
- 타입 안전성 보장
- 실시간 테스트 기능
- 자동 문서 생성 