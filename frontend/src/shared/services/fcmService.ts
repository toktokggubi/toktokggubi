import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { http } from '@/shared/api/http';

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

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * FCM 서비스 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 알림 권한 요청
      await this.requestPermission();
      
      // 백그라운드 메시지 리스너 설정
      this.setupBackgroundMessageHandler();
      
      // 포그라운드 메시지 리스너 설정
      this.setupForegroundMessageHandler();
      
      // 알림 클릭 리스너 설정
      this.setupNotificationOpenedHandler();

      this.isInitialized = true;
      console.log('FCM 서비스가 초기화되었습니다.');
    } catch (error) {
      console.error('FCM 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 권한 요청
   */
  private async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('iOS 알림 권한이 거부되었습니다.');
          return false;
        }
      }

      // Android는 자동으로 권한이 부여됨
      return true;
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 가져오기
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM 토큰:', token);
      return token;
    } catch (error) {
      console.error('FCM 토큰 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 토큰을 서버에 전송
   */
  async sendTokenToServer(token: string, authToken: string): Promise<TokenResponse> {
    try {
      const response = await http.post('/token', { token });
      
      console.log('토큰이 서버에 성공적으로 전송되었습니다.');
      return { success: true };
    } catch (error: any) {
      console.error('토큰 전송 실패:', error);
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
      
      console.log('토큰이 성공적으로 삭제되었습니다.');
      return { success: true };
    } catch (error: any) {
      console.error('토큰 삭제 실패:', error);
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
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('백그라운드에서 메시지 수신:', remoteMessage);
      
      // 백그라운드에서는 시스템 알림만 표시됨
      // 추가 처리가 필요하면 여기에 로직 추가
    });
  }

  /**
   * 포그라운드 메시지 핸들러 설정
   */
  private setupForegroundMessageHandler(): void {
    messaging().onMessage(async (remoteMessage) => {
      console.log('포그라운드에서 메시지 수신:', remoteMessage);
      
      // 포그라운드에서는 커스텀 알림 표시
      this.showForegroundNotification(remoteMessage);
    });
  }

  /**
   * 알림 클릭 핸들러 설정
   */
  private setupNotificationOpenedHandler(): void {
    // 앱이 종료된 상태에서 알림을 클릭했을 때
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('앱 종료 상태에서 알림 클릭:', remoteMessage);
          this.handleNotificationClick(remoteMessage);
        }
      });

    // 앱이 백그라운드에 있을 때 알림을 클릭했을 때
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('백그라운드에서 알림 클릭:', remoteMessage);
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
      console.error('포그라운드 알림 표시 실패:', error);
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
        // 기본 알림 처리 (예: 예산 페이지로 이동)
        this.navigateToBudgetPage();
      }
    } catch (error) {
      console.error('알림 클릭 처리 실패:', error);
    }
  }

  /**
   * 링크로 네비게이션
   */
  private navigateToLink(link: string): void {
    console.log('링크로 이동:', link);
    
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
      console.error('네비게이션 실패:', error);
      // 실패 시 홈으로 이동
      router.push('/(tabs)/home');
    }
  }

  /**
   * 예산 페이지로 이동
   */
  private navigateToBudgetPage(): void {
    console.log('예산 페이지로 이동');
    try {
      router.push('/budget');
    } catch (error) {
      console.error('예산 페이지 이동 실패:', error);
      router.push('/(tabs)/home');
    }
  }

  /**
   * 토큰 갱신 리스너 설정
   */
  setupTokenRefreshListener(): void {
    messaging().onTokenRefresh((token) => {
      console.log('FCM 토큰이 갱신되었습니다:', token);
      
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
      
      console.log('새 토큰을 서버에 전송해야 합니다:', newToken);
    } catch (error) {
      console.error('토큰 갱신 처리 실패:', error);
    }
  }
}

export default FCMService;
