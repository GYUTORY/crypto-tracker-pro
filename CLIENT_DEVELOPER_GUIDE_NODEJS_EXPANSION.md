# Node.js 서버 확장 기능 - 클라이언트 개발자 가이드

## 📋 개요

Crypto Tracker Pro의 Node.js 서버에 **사용자 중심 기능**이 추가되었습니다. 이제 Node.js 서버는 사용자 인증, 알림 관리, 대시보드 개인화 등 **사용자 경험 중심의 역할**을 담당합니다.

## 🎯 Node.js 서버 역할 확장

### ✅ 새로 추가된 기능들

| 기능 영역 | 설명 | API 엔드포인트 |
|----------|------|----------------|
| **사용자 인증** | 회원가입, 로그인, 프로필 관리 | `/auth/*` |
| **알림 시스템** | 실시간 알림, 푸시 알림 | `/notification/*` |
| **대시보드 관리** | 관심목록, 사용자 설정 | `/dashboard/*` |

### 🔄 기존 기능들 (유지)

| 기능 영역 | 설명 | API 엔드포인트 |
|----------|------|----------------|
| **가격 조회** | 실시간 암호화폐 가격 | `/price/*` |
| **차트 데이터** | 차트 및 기술적 지표 | `/chart/*` |
| **뉴스** | 암호화폐 뉴스 | `/news/*` |
| **AI 추천** | AI 기반 코인 추천 | `/recommendation/*` |
| **WebSocket** | 실시간 데이터 스트리밍 | `/stream/*` |

---

## 🔐 인증 시스템 (Authentication)

### 회원가입
```javascript
// POST /auth/register
const registerData = {
  email: "user@example.com",
  name: "홍길동",
  nickname: "crypto_trader",
  password: "securePassword123!"
};

const response = await fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(registerData)
});

// 응답: { user: UserData, token: "JWT_TOKEN" }
```

### 로그인
```javascript
// POST /auth/login
const loginData = {
  email: "user@example.com",
  password: "securePassword123!"
};

const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
});

// 응답: { user: UserData, token: "JWT_TOKEN" }
```

### 인증 토큰 사용
```javascript
// 모든 인증이 필요한 API 요청에 Authorization 헤더 추가
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// 예: 프로필 조회
const profileResponse = await fetch('/auth/profile', {
  headers: headers
});
```

### 테스트 계정
```javascript
// 개발용 테스트 계정
const testAccounts = {
  admin: {
    email: "admin@example.com",
    password: "admin123!"
  },
  user: {
    email: "user@example.com", 
    password: "user123!"
  }
};
```

---

## 🔔 알림 시스템 (Notification)

### 알림 목록 조회
```javascript
// GET /notification?page=1&limit=20&isRead=false
const notifications = await fetch('/notification?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 응답 구조
{
  success: true,
  data: {
    notifications: [
      {
        id: "n_1234567890",
        title: "비트코인 가격 알림",
        message: "BTCUSDT가 $50,000에 도달했습니다!",
        type: "PRICE_ALERT",
        priority: "MEDIUM",
        isRead: false,
        createdAt: "2024-01-15T10:30:00Z",
        data: {
          symbol: "BTCUSDT",
          targetPrice: 50000,
          currentPrice: 50000,
          isAbove: true
        }
      }
    ],
    total: 50,
    page: 1,
    limit: 20
  }
}
```

### 알림 읽음 처리
```javascript
// PUT /notification/{id}/read
await fetch(`/notification/${notificationId}/read`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 모든 알림 읽음 처리
// PUT /notification/read-all
await fetch('/notification/read-all', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 읽지 않은 알림 개수
```javascript
// GET /notification/unread-count
const unreadCount = await fetch('/notification/unread-count', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 응답: { success: true, data: 5 }
```

### 푸시 알림 구독
```javascript
// POST /notification/push/subscribe
const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/...",
  keys: {
    p256dh: "BEl62iUYgUivxIkv69yViEuiBIa1...",
    auth: "tBHI6NXuIttJDCf8Xa..."
  }
};

await fetch('/notification/push/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(subscription)
});
```

---

## 📊 대시보드 관리 (Dashboard)

### 대시보드 조회
```javascript
// GET /dashboard
const dashboard = await fetch('/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 응답 구조
{
  success: true,
  data: {
    id: "d_1234567890",
    userId: "u_1234567890",
    watchlist: [
      {
        symbol: "BTCUSDT",
        addedAt: "2024-01-15T10:30:00Z",
        currentPrice: 50000.00,
        change24h: 2.5
      }
    ],
    preferredTimeframe: "1h",
    theme: "dark",
    notificationSettings: {
      priceAlerts: true,
      newsUpdates: true,
      recommendations: true
    },
    layoutSettings: {
      showPriceChart: true,
      showTechnicalIndicators: true,
      showNews: true,
      showRecommendations: true
    }
  }
}
```

### 관심목록 관리
```javascript
// 관심목록 조회
// GET /dashboard/watchlist
const watchlist = await fetch('/dashboard/watchlist', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 관심목록에 추가
// POST /dashboard/watchlist
await fetch('/dashboard/watchlist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    symbol: "ETHUSDT"
  })
});

// 관심목록에서 제거
// DELETE /dashboard/watchlist/{symbol}
await fetch('/dashboard/watchlist/ETHUSDT', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 사용자 설정 관리
```javascript
// 테마 설정
// PUT /dashboard/settings/theme
await fetch('/dashboard/settings/theme', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    theme: "dark" // "light", "dark", "auto"
  })
});

// 차트 타임프레임 설정
// PUT /dashboard/settings/timeframe
await fetch('/dashboard/settings/timeframe', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    timeframe: "1h" // "1m", "5m", "15m", "1h", "4h", "1d", "1w"
  })
});

// 알림 설정
// PUT /dashboard/settings/notifications
await fetch('/dashboard/settings/notifications', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    notificationSettings: {
      priceAlerts: true,
      newsUpdates: false,
      recommendations: true
    }
  })
});
```

---

## 🔧 클라이언트 구현 가이드

### 1. 인증 상태 관리
```javascript
// React Context 또는 Redux를 사용한 인증 상태 관리
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
  }

  async login(email, password) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      this.token = data.data.token;
      this.user = data.data.user;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user_data', JSON.stringify(this.user));
    }
    return data;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}
```

### 2. 알림 관리
```javascript
class NotificationManager {
  constructor(authManager) {
    this.authManager = authManager;
    this.unreadCount = 0;
  }

  async getNotifications(page = 1, limit = 20) {
    const response = await fetch(
      `/notification?page=${page}&limit=${limit}`,
      { headers: this.authManager.getAuthHeaders() }
    );
    return await response.json();
  }

  async markAsRead(notificationId) {
    await fetch(`/notification/${notificationId}/read`, {
      method: 'PUT',
      headers: this.authManager.getAuthHeaders()
    });
  }

  async getUnreadCount() {
    const response = await fetch('/notification/unread-count', {
      headers: this.authManager.getAuthHeaders()
    });
    const data = await response.json();
    this.unreadCount = data.data;
    return this.unreadCount;
  }

  // 실시간 알림 업데이트 (WebSocket 또는 Polling)
  startNotificationPolling() {
    setInterval(async () => {
      await this.getUnreadCount();
      // UI 업데이트 로직
    }, 30000); // 30초마다 체크
  }
}
```

### 3. 대시보드 관리
```javascript
class DashboardManager {
  constructor(authManager) {
    this.authManager = authManager;
    this.dashboard = null;
  }

  async getDashboard() {
    const response = await fetch('/dashboard', {
      headers: this.authManager.getAuthHeaders()
    });
    const data = await response.json();
    this.dashboard = data.data;
    return this.dashboard;
  }

  async addToWatchlist(symbol) {
    await fetch('/dashboard/watchlist', {
      method: 'POST',
      headers: this.authManager.getAuthHeaders(),
      body: JSON.stringify({ symbol })
    });
    await this.getDashboard(); // 대시보드 새로고침
  }

  async removeFromWatchlist(symbol) {
    await fetch(`/dashboard/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: this.authManager.getAuthHeaders()
    });
    await this.getDashboard(); // 대시보드 새로고침
  }

  async updateTheme(theme) {
    await fetch('/dashboard/settings/theme', {
      method: 'PUT',
      headers: this.authManager.getAuthHeaders(),
      body: JSON.stringify({ theme })
    });
  }
}
```

---

## 🚀 React 컴포넌트 예시

### 로그인 컴포넌트
```jsx
import React, { useState } from 'react';

const LoginComponent = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data.data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
    </form>
  );
};
```

### 알림 컴포넌트
```jsx
import React, { useState, useEffect } from 'react';

const NotificationComponent = ({ authManager }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    const response = await fetch('/notification', {
      headers: authManager.getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      setNotifications(data.data.notifications);
    }
  };

  const fetchUnreadCount = async () => {
    const response = await fetch('/notification/unread-count', {
      headers: authManager.getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      setUnreadCount(data.data);
    }
  };

  const markAsRead = async (notificationId) => {
    await fetch(`/notification/${notificationId}/read`, {
      method: 'PUT',
      headers: authManager.getAuthHeaders()
    });
    await fetchUnreadCount();
  };

  return (
    <div>
      <h3>알림 ({unreadCount}개 읽지 않음)</h3>
      {notifications.map(notification => (
        <div key={notification.id} className={notification.isRead ? 'read' : 'unread'}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <span>{new Date(notification.createdAt).toLocaleString()}</span>
          {!notification.isRead && (
            <button onClick={() => markAsRead(notification.id)}>
              읽음 처리
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 📱 모바일 앱 연동

### React Native 예시
```javascript
// React Native에서 푸시 알림 설정
import messaging from '@react-native-firebase/messaging';

class MobileNotificationManager {
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    return authStatus;
  }

  async getFCMToken() {
    const fcmToken = await messaging().getToken();
    return fcmToken;
  }

  async subscribeToPushNotifications() {
    const fcmToken = await this.getFCMToken();
    
    // 서버에 푸시 알림 구독 등록
    await fetch('/notification/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: `https://fcm.googleapis.com/fcm/send/${fcmToken}`,
        keys: {
          p256dh: "your_p256dh_key",
          auth: "your_auth_key"
        }
      })
    });
  }
}
```

---

## 🔍 API 테스트

### Postman Collection
```json
{
  "info": {
    "name": "Crypto Tracker Pro - Node.js API",
    "description": "Node.js 서버 확장 기능 API 테스트"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"name\": \"테스트 사용자\",\n  \"nickname\": \"tester\",\n  \"password\": \"test123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"user123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    },
    {
      "name": "Dashboard",
      "item": [
        {
          "name": "Get Dashboard",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/dashboard",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## ⚠️ 주의사항

### 1. 인증 토큰 관리
- JWT 토큰은 클라이언트에 안전하게 저장
- 토큰 만료 시 자동 로그아웃 처리
- 민감한 정보는 서버에만 저장

### 2. 에러 처리
```javascript
// API 호출 시 에러 처리
try {
  const response = await fetch('/api/endpoint', {
    headers: authManager.getAuthHeaders()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // 인증 실패 - 로그인 페이지로 리다이렉트
      authManager.logout();
      window.location.href = '/login';
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API 호출 실패:', error);
  // 사용자에게 에러 메시지 표시
}
```

### 3. 성능 최적화
- 알림 목록은 페이지네이션 사용
- 대시보드 데이터는 캐싱 활용
- 불필요한 API 호출 최소화

---

## 📞 지원 및 문의

### 개발 환경
- **서버 URL**: `http://localhost:3000` (개발)
- **API 문서**: `http://localhost:3000/api-docs`
- **테스트 계정**: 문서 상단 참조

### 연락처
- **백엔드 개발팀**: backend@example.com
- **기술 문서**: [GitHub Wiki](https://github.com/your-repo/wiki)
- **이슈 트래커**: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎉 마이그레이션 체크리스트

### 필수 구현 항목
- [ ] 사용자 인증 시스템 연동
- [ ] JWT 토큰 관리
- [ ] 알림 시스템 구현
- [ ] 대시보드 개인화
- [ ] 관심목록 관리
- [ ] 사용자 설정 저장/복원

### 권장 구현 항목
- [ ] 푸시 알림 설정
- [ ] 실시간 알림 업데이트
- [ ] 오프라인 지원
- [ ] 데이터 동기화
- [ ] 성능 최적화

---

**Node.js 서버가 이제 사용자 중심의 의미 있는 역할을 담당합니다!** 🚀

- **Java 서버**: 성능 중심 (기술적 지표, AI 추천, 실시간 스트리밍)
- **Node.js 서버**: 사용자 중심 (인증, 알림, 대시보드, 개인화)

각 서버가 명확한 책임을 가지고 하이브리드 아키텍처를 구성할 수 있습니다!
