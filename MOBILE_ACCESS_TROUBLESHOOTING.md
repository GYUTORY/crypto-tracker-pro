# 📱 핸드폰 서버 접근 문제 해결 가이드

## 🔍 문제 진단 체크리스트

### 1. 네트워크 연결 확인

#### 같은 Wi-Fi 네트워크인지 확인
```bash
# 컴퓨터에서 현재 Wi-Fi 정보 확인
networksetup -getairportnetwork en0

# 핸드폰에서도 같은 Wi-Fi에 연결되어 있는지 확인
```

#### IP 주소 확인
```bash
# 컴퓨터 IP 주소
ifconfig | grep "inet " | grep -v 127.0.0.1
# 결과: 172.30.1.4

# 핸드폰에서 ping 테스트
ping 172.30.1.4
```

### 2. 서버 상태 확인

#### 서버가 실행 중인지 확인
```bash
# 포트 3000 사용 중인 프로세스 확인
lsof -i :3000

# 서버 로그 확인
tail -f logs/app.log
```

#### 서버 접근 테스트 (컴퓨터에서)
```bash
# 로컬 접근 테스트
curl http://localhost:3000/tcp/status

# 네트워크 접근 테스트
curl http://172.30.1.4:3000/tcp/status
```

### 3. 방화벽 설정 확인

#### macOS 방화벽 설정
```bash
# 방화벽 상태 확인
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Node.js 허용
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node

# 또는 포트 3000 허용
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

#### 네트워크 방화벽 확인
```bash
# 포트 3000이 열려있는지 확인
nc -z 172.30.1.4 3000

# 또는 telnet으로 테스트
telnet 172.30.1.4 3000
```

### 4. 핸드폰에서 테스트

#### 브라우저에서 접근
- **URL**: `http://172.30.1.4:3000`
- **API 문서**: `http://172.30.1.4:3000/api-docs`
- **헬스체크**: `http://172.30.1.4:3000/tcp/status`

#### 핸드폰 터미널 앱에서 테스트
```bash
# curl 명령어로 테스트
curl http://172.30.1.4:3000/tcp/status

# 또는 ping 테스트
ping 172.30.1.4
```

### 5. 프론트엔드 설정 확인

#### 환경 변수 설정
프론트엔드 프로젝트의 `.env.local` 파일:
```env
VITE_API_BASE_URL=http://172.30.1.4:3000
VITE_WS_URL=ws://172.30.1.4:3000
```

#### 프론트엔드 재시작
```bash
# 프론트엔드 프로젝트에서
npm run dev
```

---

## 🚨 일반적인 문제와 해결책

### 문제 1: "연결할 수 없습니다" 오류

#### 원인
- 서버가 실행되지 않음
- 포트가 차단됨
- IP 주소가 잘못됨

#### 해결책
```bash
# 1. 서버 실행 확인
npm run start:dev

# 2. 포트 확인
lsof -i :3000

# 3. IP 주소 재확인
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 문제 2: "CORS 오류" 발생

#### 원인
- CORS 설정 문제
- 프론트엔드에서 잘못된 URL 사용

#### 해결책
1. 서버의 CORS 설정 확인
2. 프론트엔드 환경 변수 확인
3. 브라우저 캐시 삭제

### 문제 3: "타임아웃" 오류

#### 원인
- 네트워크 연결 문제
- 방화벽 차단
- 서버 응답 지연

#### 해결책
```bash
# 1. 네트워크 연결 테스트
ping 172.30.1.4

# 2. 방화벽 설정 확인
sudo pfctl -s all

# 3. 서버 로그 확인
tail -f logs/app.log
```

---

## 🔧 추가 해결 방법

### 1. 다른 포트 사용
포트 3000이 문제라면 다른 포트 사용:

```bash
# 환경 변수로 포트 변경
PORT=3001 npm run start:dev

# 접근 URL: http://172.30.1.4:3001
```

### 2. ngrok 사용 (임시 해결책)
```bash
# ngrok 설치
npm install -g ngrok

# 터널 생성
ngrok http 3000

# 제공된 URL 사용 (예: https://abc123.ngrok.io)
```

### 3. 방화벽 완전 비활성화 (개발용)
```bash
# macOS 방화벽 비활성화
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# 테스트 후 다시 활성화
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

---

## 📋 최종 체크리스트

### 서버 측
- [ ] 서버가 `0.0.0.0:3000`에서 실행 중
- [ ] CORS 설정이 모든 도메인 허용
- [ ] 방화벽에서 포트 3000 허용
- [ ] 로그에서 에러 없음

### 네트워크 측
- [ ] 컴퓨터와 핸드폰이 같은 Wi-Fi
- [ ] IP 주소가 `172.30.1.4`
- [ ] 핸드폰에서 ping 성공
- [ ] 포트 3000 연결 가능

### 프론트엔드 측
- [ ] 환경 변수에 올바른 IP 설정
- [ ] 프론트엔드 재시작 완료
- [ ] 브라우저 캐시 삭제

### 테스트
- [ ] `http://172.30.1.4:3000/tcp/status` 접근 성공
- [ ] `http://172.30.1.4:3000/api-docs` 접근 성공
- [ ] 프론트엔드에서 API 호출 성공

---

## 🆘 여전히 문제가 있다면

### 1. 로그 확인
```bash
# 서버 로그
tail -f logs/app.log

# 에러 로그
tail -f logs/error.log

# 시스템 로그
sudo log show --predicate 'process == "node"' --last 5m
```

### 2. 네트워크 진단
```bash
# 네트워크 인터페이스 확인
ifconfig

# 라우팅 테이블
netstat -rn

# 포트 스캔
nmap -p 3000 172.30.1.4
```

### 3. 대안 방법
- **ngrok 사용**: 임시로 외부 접근 가능
- **다른 포트 사용**: 3001, 8080 등
- **VPN 사용**: 같은 네트워크 환경 구성

---

**핵심 접근 URL**: `http://172.30.1.4:3000`

