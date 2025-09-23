import { colors } from "@/shared/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface NotificationIconProps {
  onPress?: () => void;
  unreadCount?: number; // 읽지 않은 알림 개수
}

export default function NotificationIcon({
  onPress,
  unreadCount = 0,
}: NotificationIconProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
        color={colors.GRAY_NORMAL}
      />
      {unreadCount > 0 && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    alignSelf: "flex-end", // 오른쪽 정렬
    marginTop: 20, // 상단 여백
    marginRight: 20, // 오른쪽 여백
    marginBottom: 0,
    zIndex: 9999, // 다른 요소들 위에 표시
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.BLUE_NORMAL,
  },
});
