// RootLayout.tsx
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Text, TextInput } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FCMService from "@/shared/services/fcmService";
import NotificationHandler from "@/shared/components/NotificationHandler";

// 스플래시 스크린을 수동으로 제어하도록 설정
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSansKR_Light: require("@/assets/fonts/NotoSansKR-Light.ttf"),
    NotoSansKR_Regular: require("@/assets/fonts/NotoSansKR-Regular.ttf"),
    NotoSansKR_Medium: require("@/assets/fonts/NotoSansKR-Medium.ttf"),
    NotoSansKR_Bold: require("@/assets/fonts/NotoSansKR-Bold.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);

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

    // FCM 서비스 초기화
    const initializeFCM = async () => {
      try {
        console.log('🔔 FCM: 서비스 초기화 시작');
        const fcmService = FCMService.getInstance();
        await fcmService.initialize();
        fcmService.setupTokenRefreshListener();
        console.log('🔔 FCM: 서비스 초기화 완료');
        
        // 초기화 후 토큰 테스트
        await fcmService.testTokenRetrieval();
      } catch (error) {
        console.log('🔔 FCM: 초기화 실패:', error);
      }
    };

    const prepareApp = async () => {
      try {
        // FCM 초기화
        await initializeFCM();
        
        // 스플래시 스크린을 2초간 표시 (충분히 볼 수 있도록)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setAppIsReady(true);
      } catch (error) {
        console.error('앱 초기화 실패:', error);
        setAppIsReady(true); // 에러가 발생해도 앱은 실행
      }
    };

    prepareApp();

    // 전역 기본값 (필요시 숫자만 조절)
    const BASE_FONT_SIZE = 16;
    const BASE_LINE_HEIGHT = 16;

    // ---------- Text ----------
    const RNText = Text as unknown as {
      defaultProps?: { style?: object; allowFontScaling?: boolean };
    } & typeof Text;

    RNText.defaultProps = RNText.defaultProps ?? {};
    const prevTextStyle = RNText.defaultProps.style;

    RNText.defaultProps.allowFontScaling = false;
    RNText.defaultProps.style = [
      {
        fontFamily: "NotoSansKR_Regular",
        fontSize: BASE_FONT_SIZE,
        lineHeight: BASE_LINE_HEIGHT,
        ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
      },
      ...(Array.isArray(prevTextStyle)
        ? prevTextStyle
        : prevTextStyle
        ? [prevTextStyle]
        : []),
    ];

    // ---------- TextInput ----------
    const RNTextInput = TextInput as unknown as {
      defaultProps?: { style?: object; allowFontScaling?: boolean };
    } & typeof TextInput;

    RNTextInput.defaultProps = RNTextInput.defaultProps ?? {};
    const prevInputStyle = RNTextInput.defaultProps.style;

    RNTextInput.defaultProps.allowFontScaling = false;
    RNTextInput.defaultProps.style = [
      {
        fontFamily: "NotoSansKR_Regular",
        fontSize: BASE_FONT_SIZE,
        height: 44,
        lineHeight: 44,
        paddingVertical: 0,
        ...(Platform.OS === "android"
          ? { textAlignVertical: "center" as const, minHeight: 0 }
          : null),
      },
      ...(Array.isArray(prevInputStyle)
        ? prevInputStyle
        : prevInputStyle
        ? [prevInputStyle]
        : []),
    ];
  }, [loaded]);

  // 앱이 준비되면 스플래시 스크린 숨기기
  useEffect(() => {
    if (appIsReady) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.log('스플래시 스크린 숨기기 실패:', error);
        }
      };
      hideSplash();
    }
  }, [appIsReady]);

  if (!loaded || !appIsReady) return null; // 폰트 로딩 전이나 앱 준비 전엔 null로

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <NotificationHandler>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="pay" options={{ headerShown: false }} />
                <Stack.Screen name="budget" options={{ headerShown: false }} />
                <Stack.Screen name="notification" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </NotificationHandler>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
