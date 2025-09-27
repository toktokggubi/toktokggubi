import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { http } from '@/shared/api/http';
import Constants from 'expo-constants';
import NotificationSettingsService from './notificationSettingsService';

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface FCMNotification {
  title: string;
  body: string;
  link?: string;
  data?: Record<string, any>;
}

export interface TokenResponse {
  success: boolean;
  message?: string;
}

class FCMService {
  private static instance: FCMService;
  private isInitialized = false;
  private messaging: any = null;
  private notificationSettingsService = NotificationSettingsService.getInstance();

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Firebase 메시징 모듈 동적 로드
   */
  private async loadMessaging(): Promise<any> {
    if (this.messaging) return this.messaging;
    
    try {
      // Expo 개발 환경에서는 Firebase 모듈이 없을 수 있음
      if (Constants.appOwnership === 'expo') {
        return null;
      }
      
      const messagingModule = await import('@react-native-firebase/messaging');
      this.messaging = messagingModule.default;
      return this.messaging;
    } catch (error) {
      return null;
    }
  }

  /**
   * FCM 서비스 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Firebase 메시징 모듈 로드
      const messaging = await this.loadMessaging();
      
      if (!messaging) {
        this.isInitialized = true;
        return;
      }

      // 알림 권한 요청
      await this.requestPermission();
      
      // 백그라운드 메시지 리스너 설정
      this.setupBackgroundMessageHandler();
      
      // 포그라운드 메시지 리스너 설정
      this.setupForegroundMessageHandler();
      
      // 알림 클릭 리스너 설정
      this.setupNotificationOpenedHandler();

      this.isInitialized = true;
    } catch (error) {
      // 오류가 발생해도 앱이 중단되지 않도록 함
      this.isInitialized = true;
    }
  }

  /**
   * 알림 권한 요청
   */
  private async requestPermission(): Promise<boolean> {
    try {
      if (!this.messaging) return false;
      
      if (Platform.OS === 'ios') {
        const authStatus = await this.messaging().requestPermission();
        const enabled =
          authStatus === this.messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === this.messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          return false;
        }
      }

      // Android는 자동으로 권한이 부여됨
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * FCM 토큰 가져오기
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.messaging) return null;
      
      const token = await this.messaging().getToken();
      return token;
    } catch (error) {
      return null;
    }
  }

  /**
   * 토큰을 서버에 전송
   */
  async sendTokenToServer(token: string, authToken: string): Promise<TokenResponse> {
    try {
      const response = await http.post('/token', { token });
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error?.response?.data?.message || '토큰 전송 중 오류가 발생했습니다.' 
      };
    }
  }

  /**
   * 토큰 삭제 (로그아웃 시)
   */
  async deleteToken(authToken: string, deleteAll = false): Promise<TokenResponse> {
    try {
      const url = deleteAll ? '/token/all' : '/token';
      const response = await http.delete(url);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error?.response?.data?.message || '토큰 삭제 중 오류가 발생했습니다.' 
      };
    }
  }

  /**
   * 백그라운드 메시지 핸들러 설정
   */
  private setupBackgroundMessageHandler(): void {
    if (!this.messaging) return;
    
    this.messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      
      // 백그라운드에서는 시스템 알림만 표시됨
      // 추가 처리가 필요하면 여기에 로직 추가
    });
  }

  /**
   * 포그라운드 메시지 핸들러 설정
   */
  private setupForegroundMessageHandler(): void {
    if (!this.messaging) return;
    
    this.messaging().onMessage(async (remoteMessage: any) => {
      
      // 포그라운드에서는 커스텀 알림 표시
      this.showForegroundNotification(remoteMessage);
    });
  }

  /**
   * 알림 클릭 핸들러 설정
   */
  private setupNotificationOpenedHandler(): void {
    if (!this.messaging) return;
    
    // 앱이 종료된 상태에서 알림을 클릭했을 때
    this.messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          this.handleNotificationClick(remoteMessage);
        }
      });

    // 앱이 백그라운드에 있을 때 알림을 클릭했을 때
    this.messaging().onNotificationOpenedApp((remoteMessage: any) => {
      this.handleNotificationClick(remoteMessage);
    });
  }

  /**
   * 포그라운드에서 커스텀 알림 표시
   */
  private async showForegroundNotification(remoteMessage: any): Promise<void> {
    try {
      const { notification, data } = remoteMessage;
      
      if (notification) {
        // 알림 타입 확인하여 설정에 따라 표시 여부 결정
        const notificationType = data?.type || 'UNKNOWN';
        const shouldShow = await this.notificationSettingsService.shouldSendNotification(notificationType);
        
        if (!shouldShow) {
          return;
        }
        
        // Expo Notifications를 사용하여 커스텀 알림 표시
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title || '알림',
            body: notification.body || '',
            data: data || {},
          },
          trigger: null, // 즉시 표시
        });
      }
    } catch (error) {
    }
  }

  /**
   * 알림 클릭 처리
   */
  private handleNotificationClick(remoteMessage: any): void {
    try {
      const { notification, data } = remoteMessage;
      
      if (data?.link) {
        // 링크가 있으면 해당 페이지로 이동
        this.navigateToLink(data.link);
      } else if (notification) {
        // 기본 알림 처리 - 홈으로 이동
        this.navigateToHome();
      }
    } catch (error) {
      // 에러 발생 시에도 홈으로 이동
      this.navigateToHome();
    }
  }

  /**
   * 링크로 네비게이션
   */
  private navigateToLink(link: string): void {
    
    try {
      // 링크에 따른 네비게이션 처리
      if (link.includes('budget')) {
        router.push('/budget');
      } else if (link.includes('home')) {
        router.push('/(tabs)/home');
      } else if (link.includes('lucky')) {
        router.push('/(tabs)/lucky');
      } else if (link.includes('mypage')) {
        router.push('/(tabs)/mypage');
      } else {
        // 기본적으로 홈으로 이동
        router.push('/(tabs)/home');
      }
    } catch (error) {
      // 실패 시 홈으로 이동
      router.push('/(tabs)/home');
    }
  }

  /**
   * 홈 페이지로 이동
   */
  private navigateToHome(): void {
    try {
      router.push('/(tabs)/home');
    } catch (error) {
    }
  }

  /**
   * 토큰 갱신 리스너 설정
   */
  setupTokenRefreshListener(): void {
    if (!this.messaging) return;
    
    this.messaging().onTokenRefresh((token: any) => {
      
      // 토큰이 갱신되면 서버에 새 토큰 전송
      // 이때는 사용자가 로그인되어 있는지 확인 필요
      this.handleTokenRefresh(token);
    });
  }

  /**
   * 토큰 갱신 처리
   */
  private async handleTokenRefresh(newToken: string): Promise<void> {
    try {
      // 로그인 상태 확인 (예: AsyncStorage에서 토큰 확인)
      // const authToken = await AsyncStorage.getItem('authToken');
      // if (authToken) {
      //   await this.sendTokenToServer(newToken, authToken);
      // }
      
    } catch (error) {
    }
  }

  /**
   * 토큰 확인을 위한 테스트 함수 (개발용)
   */
  async testTokenRetrieval(): Promise<void> {
    
    try {
      // Firebase 메시징 모듈 로드 확인
      const messaging = await this.loadMessaging();
      
      if (!messaging) {
        return;
      }
      
      
      // 토큰 가져오기
      const token = await this.getToken();
      
      if (token) {
        
        // 토큰 유효성 간단 체크
        if (token.length > 100 && token.includes(':')) {
        } else {
        }
      } else {
      }
      
    } catch (error) {
    }
    
  }
}

export default FCMService;
