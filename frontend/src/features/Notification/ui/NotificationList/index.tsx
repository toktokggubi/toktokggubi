import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import type { NotificationItem } from "../../templates/NotificationTemplate/types";
import NotificationItemComponent from "../NotificationItem";

interface NotificationListProps {
  notifications: NotificationItem[];
  onNotificationPress?: (notification: NotificationItem) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const { height: screenHeight } = Dimensions.get("window");

export default function NotificationList({
  notifications,
  onNotificationPress,
  onRefresh,
  refreshing = false,
}: NotificationListProps) {
  const renderNotificationItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => (
    <NotificationItemComponent
      notification={item}
      onPress={onNotificationPress}
      isLast={index === notifications.length - 1}
    />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, { height: screenHeight - 100 }]}>
      <Text style={styles.emptyTitle}>알림이 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        새로운 알림이 오면 여기에 표시됩니다.
      </Text>
    </View>
  );

  // 알림이 없을 때는 FlatList 대신 직접 빈 상태 렌더링
  if (notifications.length === 0) {
    return (
      <View style={styles.emptyScreenContainer}>
        <Text style={styles.emptyTitle}>알림이 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          새로운 알림이 오면 여기에 표시됩니다.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotificationItem}
      keyExtractor={(item) => item.notificationId.toString()}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  emptyScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingHorizontal: 40,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%", // 전체 높이 차지
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.GRAY_DARKER,
    marginBottom: 0,
    ...font.medium,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
    lineHeight: 20,
  },
});
