import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const NoReportScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 캐릭터 이미지 */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/character/stupid.png")}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>

        {/* 메시지 */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>리포트 준비 중이에요!</Text>
          <Text style={styles.message}>
            전월 리포트가 없을 때는{"\n"}다음 달부터 리포트를 확인할 수 있어요.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 150,
  },
  imageContainer: {
    marginBottom: 3,
  },
  characterImage: {
    width: 140,
    height: 140,
  },
  messageContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    ...font.bold,
    color: colors.BLUE_DARKER,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    ...font.regular,
    color: colors.GRAY_DARK,
    lineHeight: 24,
    textAlign: "center",
  },
});
