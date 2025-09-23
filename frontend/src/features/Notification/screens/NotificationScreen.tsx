import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>알림</Text>
        <Text style={styles.subtitle}>아직 받은 알림이 없습니다</Text>
        <Text style={styles.description}>
          새로운 알림이 오면 여기에 표시됩니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.GRAY_DARKER,
    marginBottom: 16,
    ...font.bold,
  },
  subtitle: {
    fontSize: 18,
    color: colors.GRAY_NORMAL,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: colors.GRAY_LIGHT,
    textAlign: "center",
    lineHeight: 20,
  },
});
