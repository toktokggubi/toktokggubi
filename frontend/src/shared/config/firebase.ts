// Firebase 설정 파일
// 실제 프로젝트에서는 firebase.json과 google-services.json 파일이 필요합니다.

export const firebaseConfig = {
  // Firebase 프로젝트 실제 설정값
  apiKey: "AIzaSyCCu3X8RWUQz-wv1NxKqB-sMPXPJs3E2Ok",
  authDomain: "toktokggubi-a65f2.firebaseapp.com",
  projectId: "toktokggubi-a65f2",
  storageBucket: "toktokggubi-a65f2.firebasestorage.app",
  messagingSenderId: "374294761901",
  appId: "1:374294761901:android:f2168008ac15b0d5295124",
};

// FCM 설정
export const fcmConfig = {
  // 알림 채널 설정 (Android)
  defaultChannelId: 'toktokggubi_default',
  defaultChannelName: '똑똑꺼비 알림',
  defaultChannelDescription: '똑똑꺼비 앱의 기본 알림 채널',
  
  // 알림 아이콘 (Android)
  smallIcon: 'ic_notification',
  
  // 알림 색상 (Android)
  color: '#FF6B6B',
  
  // 알림 사운드
  sound: 'default',
  
  // 진동 설정
  vibrate: true,
};

// 알림 타입별 설정
export const notificationTypes = {
  BUDGET_THRESHOLD: {
    title: '예산 임계점 도달',
    body: '카테고리 예산의 80%를 초과했습니다.',
    icon: 'ic_budget',
    color: '#FF6B6B',
  },
  PAYMENT_SUCCESS: {
    title: '결제 완료',
    body: '결제가 성공적으로 완료되었습니다.',
    icon: 'ic_payment',
    color: '#4CAF50',
  },
  GENERAL: {
    title: '알림',
    body: '새로운 알림이 있습니다.',
    icon: 'ic_notification',
    color: '#2196F3',
  },
};
