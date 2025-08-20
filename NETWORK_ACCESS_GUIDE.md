# 🌐 네트워크 접근 설정 가이드

## 📱 핸드폰에서 서버 접근하기

### 🎯 목표
핸드폰에서 개발 서버에 접근할 수 있도록 네트워크 설정을 구성합니다.

---

## 🔧 서버 설정 변경사항

### 1. 서버 바인딩 주소 변경
- **이전**: `localhost` (127.0.0.1) - 로컬에서만 접근 가능
- **현재**: `0.0.0.0` - 모든 네트워크 인터페이스에서 접근 가능

### 2. CORS 설정 업데이트
- 모든 도메인에서의 접근 허용
- 추가 HTTP 메서드 지원 (OPTIONS)
- 추가 헤더 허용

### 3. 네트워크 IP 자동 감지
- 서버 시작 시 로컬 IP 주소 자동 표시
- Swagger 문서에 네트워크 접근 URL 추가

---

## 🚀 서버 실행

### 1. 서버 시작
```bash
npm run start:dev
```

### 2. 접근 URL 확인
서버 시작 시 다음과 같은 로그가 표시됩니다:

```
[INFO] 서버 시작: http://localhost:3000
[INFO] 네트워크 접근: http://172.30.1.4:3000
[INFO] API 문서: http://localhost:3000/api-docs
[INFO] API 문서 (네트워크): http://172.30.1.4:3000/api-docs
```

---

## 📱 핸드폰 접근 방법

### 1. 같은 Wi-Fi 네트워크 확인
- 핸드폰과 컴퓨터가 같은 Wi-Fi에 연결되어 있는지 확인
- 네트워크 이름이 동일한지 확인

### 2. 핸드폰에서 접근
- **브라우저에서**: `http://172.30.1.4:3000`
- **API 문서**: `http://172.30.1.4:3000/api-docs`
- **특정 API**: `http://172.30.1.4:3000/price/BTCUSDT`

### 3. 프론트엔드 설정
프론트엔드의 환경 변수에서 API 주소를 변경:

```env
# .env.local (프론트엔드 프로젝트)
VITE_API_BASE_URL=http://172.30.1.4:3000
VITE_WS_URL=ws://172.30.1.4:3000
```

---

## 🔍 문제 해결

### 1. 접근이 안 되는 경우

#### 방화벽 확인
```bash
# macOS 방화벽 설정 확인
sudo pfctl -s all

# 포트 3000이 열려있는지 확인
lsof -i :3000
```

#### 네트워크 연결 확인
```bash
# 핸드폰에서 ping 테스트
ping 172.30.1.4

# 포트 연결 테스트
telnet 172.30.1.4 3000
```

### 2. IP 주소가 다른 경우
```bash
# 현재 IP 주소 확인
ifconfig | grep "inet " | grep -v 127.0.0.1

# 또는
ipconfig getifaddr en0  # macOS
```

### 3. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

---

## 🛡️ 보안 고려사항

### 개발 환경에서만 사용
- `0.0.0.0` 바인딩은 개발 환경에서만 사용
- 프로덕션에서는 특정 IP나 도메인으로 제한

### 방화벽 설정
```bash
# macOS에서 포트 3000 허용
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
```

---

## 📋 체크리스트

### 서버 설정
- [ ] `src/main.ts`에서 `host: '0.0.0.0'` 설정
- [ ] CORS 설정 업데이트
- [ ] Swagger 서버 URL 추가

### 네트워크 설정
- [ ] 같은 Wi-Fi 네트워크 연결 확인
- [ ] IP 주소 확인 (`172.30.1.4`)
- [ ] 포트 3000 방화벽 허용

### 프론트엔드 설정
- [ ] 환경 변수에서 API 주소 변경
- [ ] WebSocket URL 변경
- [ ] 프론트엔드 재시작

### 테스트
- [ ] 핸드폰에서 `http://172.30.1.4:3000` 접근
- [ ] API 문서 접근 확인
- [ ] 프론트엔드에서 API 호출 테스트

---

## 🎯 사용 예시

### 1. API 직접 호출
```bash
# 핸드폰에서 curl 명령어 (터미널 앱 사용)
curl http://172.30.1.4:3000/price/BTCUSDT
```

### 2. 브라우저에서 접근
- **API 문서**: `http://172.30.1.4:3000/api-docs`
- **헬스체크**: `http://172.30.1.4:3000/tcp/status`
- **가격 조회**: `http://172.30.1.4:3000/price/BTCUSDT`

### 3. 프론트엔드 연동
```javascript
// 프론트엔드에서 API 호출
const response = await fetch('http://172.30.1.4:3000/price/BTCUSDT');
const data = await response.json();
```

---

## 📞 추가 지원

### 로그 확인
```bash
# 서버 로그 실시간 확인
tail -f logs/app.log

# 에러 로그 확인
tail -f logs/error.log
```

### 네트워크 진단
```bash
# 네트워크 인터페이스 확인
ifconfig

# 라우팅 테이블 확인
netstat -rn

# 포트 스캔
nmap -p 3000 172.30.1.4
```

---

이제 핸드폰에서 서버에 접근할 수 있습니다! 🎉

**접근 URL**: `http://172.30.1.4:3000`
