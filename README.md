# Crypto Tracker Pro

비트코인 바이낸스 웹소켓 연결을 위한 NestJS 프로젝트입니다.

## 기술 스택

- **Node.js**: 22.x
- **NestJS**: 10.x
- **TypeScript**: 5.x
- **WebSocket**: ws, Socket.io
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
├── websocket/            # 웹소켓 관련 모듈
│   ├── websocket.module.ts
│   ├── websocket.gateway.ts
│   └── websocket.service.ts
└── binance/              # 바이낸스 API 관련
    ├── binance.module.ts
    ├── binance.service.ts
    └── binance.websocket.ts
```

## API 엔드포인트

- `GET /` - 헬스체크
- `WebSocket /ws` - 실시간 비트코인 가격 데이터

## 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
PORT=3000
BINANCE_WS_URL=wss://stream.binance.com:9443/ws/btcusdt@trade
```

## 개발 도구

- **코드 포맷팅**: `npm run format`
- **린팅**: `npm run lint`
- **테스트**: `npm run test`
- **테스트 커버리지**: `npm run test:cov` 