# ⚡ 핸드폰 접근 빠른 해결책

## 🎯 가장 빠른 해결 방법

### 1. 방화벽 설정 (가장 일반적인 원인)

```bash
# macOS 방화벽에서 Node.js 허용
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node

# 또는 방화벽 완전 비활성화 (개발용)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### 2. 서버 재시작

서버가 `0.0.0.0:3000`에서 실행되도록 재시작:

```bash
# 기존 프로세스 종료 후
npm run start:dev
```

### 3. 핸드폰에서 테스트

**핸드폰 브라우저에서 다음 URL 접근:**

- **서버 상태**: `http://172.30.1.4:3000/tcp/status`
- **API 문서**: `http://172.30.1.4:3000/api-docs`
- **가격 조회**: `http://172.30.1.4:3000/price/BTCUSDT`

### 4. 프론트엔드 환경 변수 수정

프론트엔드 프로젝트의 `.env.local` 파일:

```env
VITE_API_BASE_URL=http://172.30.1.4:3000
VITE_WS_URL=ws://172.30.1.4:3000
```

---

## 🔍 빠른 진단

### 컴퓨터에서 테스트
```bash
# 네트워크 접근 테스트
curl http://172.30.1.4:3000/tcp/status

# 포트 확인
lsof -i :3000
```

### 핸드폰에서 테스트
- **ping 테스트**: `ping 172.30.1.4`
- **브라우저 접근**: `http://172.30.1.4:3000`

---

## 🚨 여전히 안 되면

### 대안 1: 다른 포트 사용
```bash
PORT=3001 npm run start:dev
# 접근: http://172.30.1.4:3001
```

### 대안 2: ngrok 사용 (가장 확실한 방법)
```bash
# ngrok 설치
npm install -g ngrok

# 터널 생성
ngrok http 3000

# 제공된 URL 사용 (예: https://abc123.ngrok.io)
```

---

**핵심**: 방화벽 설정이 가장 일반적인 원인입니다! 🔥

