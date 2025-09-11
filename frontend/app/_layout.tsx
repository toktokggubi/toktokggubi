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
    NotoSansKR: require("@/assets/fonts/NotoSansKR-VF.ttf"),
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
    const T: any = Text;
    const TI: any = TextInput;
    T.defaultProps = T.defaultProps || {};
    TI.defaultProps = TI.defaultProps || {};
    T.defaultProps.style = [
      { fontFamily: "NotoSansKR" },
      T.defaultProps.style,
    ].flat();
    TI.defaultProps.style = [
      { fontFamily: "NotoSansKR" },
      TI.defaultProps.style,
    ].flat();
  }, [loaded]);

  if (!loaded) return null;

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
