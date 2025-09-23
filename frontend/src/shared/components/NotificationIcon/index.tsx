import { colors } from "@/shared/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface NotificationIconProps {
  onPress?: () => void;
  hasNotification?: boolean;
}

export default function NotificationIcon({
  onPress,
  hasNotification = false,
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
      {hasNotification && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.BLUE_NORMAL,
  },
});
