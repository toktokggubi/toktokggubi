# FCM 푸시 알림 구현 가이드

## 📱 구현된 기능

### 1. FCM 서비스 (`FCMService`)
- **위치**: `src/shared/services/fcmService.ts`
- **기능**:
  - FCM 토큰 획득 및 관리
  - 서버에 토큰 전송/삭제
  - 백그라운드/포그라운드 메시지 처리
  - 알림 클릭 처리 및 네비게이션

### 2. 알림 핸들러 (`NotificationHandler`)
- **위치**: `src/shared/components/NotificationHandler.tsx`
- **기능**:
  - 포그라운드 알림 표시
  - 알림 클릭 처리
  - 페이지 네비게이션

### 3. 인증 통합
- **위치**: `src/features/Auth/model/useAuthQueries.ts`
- **기능**:
  - 로그인 시 FCM 토큰 자동 전송
  - 로그아웃 시 FCM 토큰 삭제

## 🔧 설정 방법

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Android 앱 추가:
   - 패키지명: `com.technologia.toktokggubi`
   - `google-services.json` 다운로드
3. iOS 앱 추가:
   - 번들 ID 설정
   - `GoogleService-Info.plist` 다운로드

### 2. 파일 배치

```
frontend/
├── android/app/google-services.json
├── ios/GoogleService-Info.plist
└── src/shared/config/firebase.ts (설정 업데이트)
```

### 3. Firebase 설정 업데이트

`src/shared/config/firebase.ts` 파일의 설정값을 실제 Firebase 프로젝트 값으로 교체:

```typescript
export const firebaseConfig = {
  apiKey: "실제-API-키",
  authDomain: "실제-프로젝트.firebaseapp.com",
  projectId: "실제-프로젝트-ID",
  // ... 기타 설정
};
```

### 4. app.json 설정

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-location",
      "expo-video",
      [
        "@react-native-firebase/app",
        {
          "android": {
            "googleServicesFile": "./google-services.json"
          },
          "ios": {
            "googleServicesFile": "./GoogleService-Info.plist"
          }
        }
      ]
    ]
  }
}
```

## 📋 사용법

### 1. 자동 토큰 관리

로그인/회원가입 시 FCM 토큰이 자동으로 서버에 전송됩니다:

```typescript
// 이미 구현됨 - 별도 작업 불필요
const emailLoginMutation = useEmailLogin();
// 로그인 성공 시 자동으로 FCM 토큰 전송
```

### 2. 서버 API 연동

서버에서 다음 엔드포인트를 구현해야 합니다:

#### 토큰 저장
```
POST /api/token
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "token": "fcm_token_value"
}
```

#### 토큰 삭제
```
DELETE /api/token/all  # 모든 토큰 삭제
DELETE /api/token?token=...  # 특정 토큰 삭제
Authorization: Bearer <JWT>
```

### 3. 알림 수신 처리

알림은 자동으로 처리되며, 다음과 같은 경우에 표시됩니다:

- **백그라운드**: 시스템 알림으로 표시
- **포그라운드**: 커스텀 Alert로 표시
- **알림 클릭**: 해당 페이지로 자동 이동

## 🎯 알림 타입별 처리

### 예산 임계점 알림
```json
{
  "title": "예산 임계점 도달",
  "body": "카테고리 예산의 80%를 초과했습니다.",
  "data": {
    "link": "/budget",
    "type": "BUDGET_THRESHOLD"
  }
}
```

### 일반 알림
```json
{
  "title": "알림",
  "body": "새로운 알림이 있습니다.",
  "data": {
    "link": "/home",
    "type": "GENERAL"
  }
}
```

## 🔍 디버깅

### 1. 로그 확인
```typescript
// FCM 토큰 확인
const fcmService = FCMService.getInstance();
const token = await fcmService.getToken();
console.log('FCM Token:', token);
```

### 2. 알림 권한 확인
```typescript
import messaging from '@react-native-firebase/messaging';

const authStatus = await messaging().requestPermission();
console.log('알림 권한:', authStatus);
```

### 3. 테스트 알림 발송
Firebase Console > Cloud Messaging에서 테스트 알림 발송 가능

## ⚠️ 주의사항

1. **개발 환경**: 현재 preview 환경에서만 작동
2. **권한**: iOS에서는 알림 권한 요청 필요
3. **토큰 갱신**: 앱 재설치 시 토큰이 갱신됨
4. **네트워크**: 오프라인 상태에서는 알림 수신 불가

## 🚀 배포 시 체크리스트

- [ ] Firebase 프로젝트 설정 완료
- [ ] `google-services.json` 및 `GoogleService-Info.plist` 배치
- [ ] `firebase.ts` 설정값 업데이트
- [ ] 서버 API 엔드포인트 구현
- [ ] 알림 권한 테스트
- [ ] 실제 기기에서 알림 테스트
