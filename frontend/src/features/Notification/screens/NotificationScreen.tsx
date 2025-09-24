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
    (notification: NotificationItem) => {
      // TODO: 알림 상세 화면으로 이동하거나 특정 동작 수행
      console.log("알림 클릭:", notification.title);
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
