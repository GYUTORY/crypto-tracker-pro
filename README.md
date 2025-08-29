# Crypto Tracker Pro

실시간 암호화폐 가격 추적 및 AI 분석 API 서버

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# 환경 변수 예시 파일 복사
cp env.example .env

# .env 파일 편집하여 실제 값으로 수정
# 필수 설정:
# - BINANCE_API_KEY: 바이낸스 API 키
# - BINANCE_SECRET_KEY: 바이낸스 시크릿 키  
# - GOOGLE_AI_API_KEY: Google AI API 키
# - JWT_SECRET: JWT 시크릿 키 (최소 32자)
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 검증

```bash
npm run validate:env
```

### 4. 애플리케이션 시작

```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run start:prod
```

## 📋 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NODE_ENV` | 실행 환경 | `development` |
| `PORT` | 서버 포트 | `3000` |
| `BINANCE_API_KEY` | 바이낸스 API 키 | `your_api_key` |
| `BINANCE_SECRET_KEY` | 바이낸스 시크릿 키 | `your_secret_key` |
| `GOOGLE_AI_API_KEY` | Google AI API 키 | `your_google_ai_key` |
| `JWT_SECRET` | JWT 시크릿 키 | `min_32_characters_long` |

## 🔧 주요 기능

- **실시간 가격 추적**: 바이낸스 WebSocket을 통한 실시간 가격 데이터
- **AI 기반 분석**: Google Gemini AI를 활용한 기술적 분석
- **가격 예측**: 머신러닝 기반 가격 예측 모델
- **고성능 캐싱**: 메모리 기반 캐싱으로 빠른 응답
- **RESTful API**: Swagger 문서화된 REST API
- **WebSocket 지원**: 실시간 데이터 스트리밍

## 📚 API 문서

애플리케이션 시작 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **로컬**: http://localhost:3000/api-docs
- **네트워크**: http://[your-ip]:3000/api-docs

## 🏗️ 아키텍처

```
src/
├── application/          # 비즈니스 로직 (Use Cases)
├── domain/              # 도메인 모델 및 인터페이스
├── infrastructure/      # 외부 시스템 연동 (Repository 구현체)
├── presentation/        # HTTP API 컨트롤러
├── config/             # 환경 설정 관리
└── shared/             # 공통 유틸리티
```

## 🧪 테스트

```bash
# 단위 테스트
npm test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 🔒 보안

- 환경 변수를 통한 민감한 정보 관리
- JWT 기반 인증 시스템
- API 요청 제한 (Rate Limiting)
- CORS 설정
- Helmet 보안 헤더

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요. 