import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type {
  NotificationItem,
  NotificationType,
} from "../../templates/NotificationTemplate/types";

interface NotificationItemProps {
  notification: NotificationItem;
  onPress?: (notification: NotificationItem) => void;
  isLast?: boolean; // 마지막 아이템인지 여부
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "THRESHOLD/CATEGORY":
    case "THRESHOLD/TOTAL":
    case "EXCEEDED/CATEGORY":
    case "EXCEEDED/TOTAL":
      return { name: "wallet-outline" as const, color: colors.BLUE_NORMAL };
    case "LOCATION":
      return { name: "location-outline" as const, color: colors.BLUE_NORMAL };
    default:
      return {
        name: "notifications-outline" as const,
        color: colors.GRAY_NORMAL,
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "방금 전";
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  }
};

export default function NotificationItemComponent({
  notification,
  onPress,
  isLast = false,
}: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const isUnread = notification.readAt === null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUnread && styles.unreadContainer,
        isLast && styles.lastItem,
      ]}
      onPress={() => onPress?.(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name={icon.name} size={20} color={icon.color} />
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
          </View>
          <Text style={styles.time}>{formatDate(notification.sentAt)}</Text>
        </View>

        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // 알림 아이템 전체 컨테이너
  container: {
    flexDirection: "row",
    paddingHorizontal: 20, // 좌우 패딩
    paddingTop: 16, // 상단 패딩
    paddingBottom: 16, // 하단 패딩
    backgroundColor: colors.BACKGROUND_PRIMARY, // 기본 배경색
    borderBottomWidth: 1, // 하단 구분선
    borderBottomColor: colors.GRAY_LIGHT, // 구분선 색상
  },
  // 읽지 않은 알림의 배경색 (읽지 않은 알림 구분용)
  unreadContainer: {
    backgroundColor: colors.BLUE_LIGHT, // 읽지 않은 알림 배경색
  },
  // 마지막 아이템 (하단 구분선 제거)
  lastItem: {
    borderBottomWidth: 0, // 마지막 아이템은 하단 구분선 제거
  },
  // 알림 내용 영역 (아이콘 제외한 텍스트 영역)
  content: {
    flex: 1, // 남은 공간 모두 차지
  },
  // 상단 헤더 영역 (제목 + 시간)
  header: {
    flexDirection: "row", // 가로 배치
    justifyContent: "space-between", // 제목은 왼쪽, 시간은 오른쪽
    alignItems: "center", // 세로 중앙 정렬
    marginBottom: 0, // title과 content 사이 간격 제거
  },
  // 제목 행 (아이콘 + 제목)
  titleRow: {
    flexDirection: "row", // 가로 배치
    alignItems: "center", // 세로 중앙 정렬
    flex: 1, // 남은 공간 차지 (시간을 오른쪽으로 밀어냄)
    marginBottom: 0,
  },
  // 알림 제목 텍스트
  title: {
    flex: 1, // 남은 공간 차지
    fontSize: 16, // 제목 폰트 크기
    color: colors.GRAY_DARKER, // 제목 텍스트 색상
    marginLeft: 12, // 아이콘과의 간격 (더 멀게)
    ...font.medium, // 폰트 스타일
    marginBottom: 0,
  },
  // 알림 시간 텍스트
  time: {
    fontSize: 12, // 시간 폰트 크기
    color: colors.GRAY_NORMAL, // 시간 텍스트 색상
    marginLeft: 8, // 제목과의 간격
  },
  // 알림 내용 텍스트
  body: {
    fontSize: 14, // 내용 폰트 크기
    color: colors.GRAY_NORMAL, // 내용 텍스트 색상
    lineHeight: 20, // 줄 간격
    marginLeft: 32, // 제목과 왼쪽 정렬 (아이콘 크기 20 + 제목 marginLeft 12 = 32)
    marginBottom: 10,
    marginTop: -5,
  },
});
