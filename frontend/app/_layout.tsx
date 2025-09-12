import "react-native-gesture-handler";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
            staleTime: 60_000, // 1분 캐시 신선
            retry: 1, // 실패 시 1회 재시도
            refetchOnWindowFocus: false, // 모바일 UX 배려
          },
        },
      })
  );

  useEffect(() => {
    if (!loaded) return;

    // weight → fontFamily 매핑
    const fontMap: Record<string, string> = {
      "100": "NotoSansKR_Light",
      "300": "NotoSansKR_Light",
      "400": "NotoSansKR_Regular",
      normal: "NotoSansKR_Regular",
      "500": "NotoSansKR_Medium",
      "600": "NotoSansKR_Medium",
      "700": "NotoSansKR_Bold",
      bold: "NotoSansKR_Bold",
    };

    const applyFont = (style: any) => {
      const styles = Array.isArray(style) ? style.flat() : [style];
      const merged = Object.assign({}, ...styles);

      if (merged.fontFamily) return merged;

      const weight = String(merged.fontWeight ?? "400");
      merged.fontFamily = fontMap[weight] ?? "NotoSansKR_Regular";
      delete merged.fontWeight; // RN 기본 weight 혼선 제거
      return merged;
    };

    // Text 오버라이드
    const T: any = Text;
    const originalRenderText = T.render ?? T.prototype?.render;
    T.render = function render(...args: any[]) {
      const origin = originalRenderText.apply(this, args);
      return React.cloneElement(origin, {
        style: applyFont(origin.props.style),
      });
    };

    // TextInput 오버라이드
    const TI: any = TextInput;
    const originalRenderInput = TI.render ?? TI.prototype?.render;
    TI.render = function render(...args: any[]) {
      const origin = originalRenderInput.apply(this, args);
      return React.cloneElement(origin, {
        style: applyFont(origin.props.style),
      });
    };
  }, [loaded]);

  return (
    <GestureHandlerRootView>
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
