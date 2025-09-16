// RootLayout.tsx
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Text, TextInput } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSansKR_Light: require("@/assets/fonts/NotoSansKR-Light.ttf"),
    NotoSansKR_Regular: require("@/assets/fonts/NotoSansKR-Regular.ttf"),
    NotoSansKR_Medium: require("@/assets/fonts/NotoSansKR-Medium.ttf"),
    NotoSansKR_Bold: require("@/assets/fonts/NotoSansKR-Bold.ttf"),
  });

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (!loaded) return;

    // Text 전역 기본값
    const RNText = Text as unknown as {
      defaultProps?: { style?: any };
    } & typeof Text;
    RNText.defaultProps = RNText.defaultProps ?? {};
    const prevTextStyle = RNText.defaultProps.style;
    RNText.defaultProps.style = [
      { fontFamily: "NotoSansKR_Regular" },
      ...(Array.isArray(prevTextStyle)
        ? prevTextStyle
        : prevTextStyle
        ? [prevTextStyle]
        : []),
    ];

    // TextInput 전역 기본값
    const RNTextInput = TextInput as unknown as {
      defaultProps?: { style?: any; placeholderTextColor?: string };
    } & typeof TextInput;
    RNTextInput.defaultProps = RNTextInput.defaultProps ?? {};
    const prevInputStyle = RNTextInput.defaultProps.style;
    RNTextInput.defaultProps.style = [
      {
        fontFamily: "NotoSansKR_Regular",
        ...(Platform.OS === "android"
          ? {
              height: 44,
              paddingVertical: 0,
              textAlignVertical: "center" as const,
              minHeight: 0,
            }
          : { height: 44, paddingVertical: 0 }),
      },
      ...(Array.isArray(prevInputStyle)
        ? prevInputStyle
        : prevInputStyle
        ? [prevInputStyle]
        : []),
    ];
    // 필요하면 placeholder 전역색
    // RNTextInput.defaultProps.placeholderTextColor = colors.BLUE_LIGHT_ACTIVE;
  }, [loaded]);

  if (!loaded) return null; // 폰트 로딩 전엔 null로

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="pay" options={{ headerShown: false }} />
              <Stack.Screen name="budget" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
