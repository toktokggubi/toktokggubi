import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import NotificationAlert from '@/shared/ui/NotificationAlert';

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
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  
  // 알림 모달 상태
  const [notificationAlert, setNotificationAlert] = useState<{
    visible: boolean;
    title?: string;
    message: string;
  }>({
    visible: false,
    message: "",
  });

  useEffect(() => {
    // 포그라운드 알림 수신 리스너
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      
      // 포그라운드에서는 커스텀 알림 표시
      showForegroundNotification(notification);
    });

    // 알림 클릭 리스너
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      
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
      const { title, body } = notification.request.content;
      
      // 커스텀 알림 모달 표시
      setNotificationAlert({
        visible: true,
        title: title || '알림',
        message: body || '',
      });
    } catch (error) {
      console.error('알림 표시 실패:', error);
    }
  };

  /**
   * 알림 클릭 처리
   */
  const handleNotificationClick = (response: any) => {
    try {
      const { notification } = response;
      const { data } = notification.request.content;
      
      
      // 링크가 있으면 해당 페이지로 이동
      if (data?.link) {
        navigateToLink(data.link);
      } else {
        // 기본 알림 처리 (예산 페이지로 이동)
        navigateToBudgetPage();
      }
    } catch (error) {
    }
  };

  /**
   * 링크로 네비게이션
   */
  const navigateToLink = (link: string) => {
    
    try {
      // 링크에 따른 네비게이션 처리
      if (link.includes('budget')) {
        router.push('/(tabs)/home');
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
  };

  /**
   * 예산 페이지로 이동
   */
  const navigateToBudgetPage = () => {
    try {
      router.push('/(tabs)/home');
    } catch (error) {
      router.push('/(tabs)/home');
    }
  };

  return (
    <>
      {children}
      <NotificationAlert
        visible={notificationAlert.visible}
        title={notificationAlert.title}
        message={notificationAlert.message}
        onConfirm={() => {
          setNotificationAlert({ ...notificationAlert, visible: false });
        }}
      />
    </>
  );
}
