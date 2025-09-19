import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

interface NotificationHandlerProps {
  children: React.ReactNode;
}

/**
 * 알림 처리를 담당하는 컴포넌트
 * - 포그라운드 알림 표시
 * - 알림 클릭 처리
 * - 네비게이션 처리
 */
export default function NotificationHandler({ children }: NotificationHandlerProps) {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // 포그라운드 알림 수신 리스너
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('포그라운드 알림 수신:', notification);
      
      // 포그라운드에서는 커스텀 알림 표시
      showForegroundNotification(notification);
    });

    // 알림 클릭 리스너
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('알림 클릭:', response);
      
      // 알림 클릭 처리
      handleNotificationClick(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  /**
   * 포그라운드에서 커스텀 알림 표시
   */
  const showForegroundNotification = (notification: Notifications.Notification) => {
    try {
      const { title, body, data } = notification.request.content;
      
      // 커스텀 알림 표시 (Alert 사용)
      Alert.alert(
        title || '알림',
        body || '',
        [
          {
            text: '확인',
            style: 'default',
          },
          {
            text: '바로가기',
            style: 'default',
            onPress: () => handleNotificationClick({ notification }),
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('포그라운드 알림 표시 실패:', error);
    }
  };

  /**
   * 알림 클릭 처리
   */
  const handleNotificationClick = (response: any) => {
    try {
      const { notification } = response;
      const { data } = notification.request.content;
      
      console.log('알림 데이터:', data);
      
      // 링크가 있으면 해당 페이지로 이동
      if (data?.link) {
        navigateToLink(data.link);
      } else {
        // 기본 알림 처리 (예산 페이지로 이동)
        navigateToBudgetPage();
      }
    } catch (error) {
      console.error('알림 클릭 처리 실패:', error);
    }
  };

  /**
   * 링크로 네비게이션
   */
  const navigateToLink = (link: string) => {
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
  };

  /**
   * 예산 페이지로 이동
   */
  const navigateToBudgetPage = () => {
    console.log('예산 페이지로 이동');
    try {
      router.push('/budget');
    } catch (error) {
      console.error('예산 페이지 이동 실패:', error);
      router.push('/(tabs)/home');
    }
  };

  return <>{children}</>;
}
