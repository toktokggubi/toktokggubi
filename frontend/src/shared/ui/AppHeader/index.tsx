// src/shared/ui/AppHeader/index.tsx
import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, router } from "expo-router";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { CardActionMenu } from "@/features/User/ui/CardActionMeun";

import type { AppHeaderProps } from "./types";

export function AppHeader({
  title,
  showBack = true,
  onBackPress,
  onSelectImport,
  onSelectDelete,
  backgroundColor = colors.BACKGROUND_PRIMARY,
  tintColor = colors.BLUE_DARKER,
}: AppHeaderProps) {
  const navigation = useNavigation();
  const noop = React.useCallback(() => {}, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title,
      headerTitleAlign: "center",
      headerTintColor: tintColor,
      headerStyle: { backgroundColor },
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 18, ...font.bold },

      headerLeft: showBack
        ? () => (
            <Pressable
              onPress={onBackPress ?? (() => router.back())}
              style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              accessibilityLabel="뒤로가기"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color={tintColor} />
            </Pressable>
          )
        : undefined,

      // 메뉴를 보여줄 때만 렌더하되, 타입은 항상 함수가 되도록 noop로 폴백
      headerRight:
        onSelectImport || onSelectDelete
          ? () => (
              <CardActionMenu
                color={colors.BLUE_NORMAL}
                onSelectImport={onSelectImport ?? noop}
                onSelectDelete={onSelectDelete ?? noop}
              />
            )
          : undefined,
    });
  }, [
    navigation,
    title,
    showBack,
    onBackPress,
    onSelectImport,
    onSelectDelete,
    backgroundColor,
    tintColor,
    noop,
  ]);

  return null;
}
