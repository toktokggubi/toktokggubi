import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import {
  deleteNotifications,
  fetchNotifications,
  markNotificationsAsRead,
} from "../api/notificationApi";
import type { NotificationItem } from "../templates/NotificationTemplate/types";
import NotificationList from "../ui/NotificationList";

const BG = "#F8FBFF";
const TXT = "#0f172a";

export default function NotificationScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 현재 월을 저장할 상태
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });

  const handleNotificationPress = useCallback(
    async (notification: NotificationItem) => {
      try {
        // 1. 시스템 알림창에서 해당 알림 제거
        await Notifications.dismissNotificationAsync(notification.notificationId.toString());
        
        // 2. 읽지 않은 알림이면 읽음 처리
        if (!notification.readAt) {
          await markNotificationsAsRead();
          // 로컬 상태 업데이트
          setNotifications(prev => 
            prev.map(item => 
              item.notificationId === notification.notificationId 
                ? { ...item, readAt: new Date().toISOString() }
                : item
            )
          );
        }
        
        // 3. 알림 타입에 따른 페이지 이동
        switch (notification.type) {
          case 'THRESHOLD/TOTAL':
          case 'THRESHOLD/CATEGORY':
          case 'EXCEEDED/TOTAL':
          case 'EXCEEDED/CATEGORY':
          case 'LOCATION':
          default:
            router.push('/(tabs)/home');
        }
        
        console.log("알림 클릭 처리 완료:", notification.title);
      } catch (error) {
        console.error("알림 클릭 처리 실패:", error);
        // 에러가 발생해도 기본적으로 홈으로 이동
        router.push('/(tabs)/home');
      }
    },
    []
  );

  // 월이 바뀌었는지 확인하고 이전 달 알림 자동 삭제
  const checkAndDeletePreviousMonthNotifications = useCallback(async () => {
    const now = new Date();
    const newMonth = `${now.getFullYear()}-${now.getMonth()}`;

    // 월이 바뀌었는지 확인
    if (currentMonth !== newMonth) {
      try {
        console.log(`월이 바뀌었습니다: ${currentMonth} → ${newMonth}`);
        // 이전 달 알림 삭제
        await deleteNotifications();
        // 현재 월 업데이트
        setCurrentMonth(newMonth);
        // 삭제 후 알림 목록 다시 로드
        await loadNotifications();
      } catch (error) {
        console.error("이전 달 알림 삭제 실패:", error);
      }
    }
  }, [currentMonth]);

  // 알림 개수 업데이트를 위한 콜백 (다른 페이지에서 사용)
  const updateNotificationCount = useCallback(() => {
    // 이 함수는 다른 페이지에서 알림 개수를 업데이트할 때 사용
    // 현재는 NotificationScreen에서만 사용하므로 빈 함수
  }, []);

  // 알림 데이터 로드 및 읽음 처리
  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // 월 변경 확인 및 이전 달 알림 자동 삭제
        await checkAndDeletePreviousMonthNotifications();

        // 1. 알림 목록 조회
        const notificationData = await fetchNotifications();
        setNotifications(notificationData.items);

        // 2. 읽지 않은 알림이 있으면 읽음 처리
        const unreadCount = notificationData.items.filter(
          (notification) => notification.readAt === null
        ).length;

        if (unreadCount > 0) {
          await markNotificationsAsRead();
          // 시스템 알림창의 모든 알림도 제거
          await Notifications.dismissAllNotificationsAsync();
        }
      } catch (error) {
        console.error("알림 로드 실패:", error);
        // 에러 시 빈 배열로 설정
        setNotifications([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [checkAndDeletePreviousMonthNotifications]
  );

  const handleRefresh = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // 컴포넌트 마운트 시 알림 로드
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 실시간 알림 업데이트를 위한 리스너
  useEffect(() => {
    // 새로운 알림이 올 때마다 알림 목록 새로고침
    const subscription = Notifications.addNotificationReceivedListener(() => {
      console.log('새로운 알림 수신됨, 목록 새로고침');
      loadNotifications(true);
    });

    return () => {
      subscription.remove();
    };
  }, [loadNotifications]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "알림",
      headerTitleAlign: "center",
      headerTintColor: TXT,
      headerStyle: { backgroundColor: BG },
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 18, ...font.bold },
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Ionicons name="chevron-back" size={24} color={TXT} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <NotificationList
        notifications={notifications}
        onNotificationPress={handleNotificationPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
});
