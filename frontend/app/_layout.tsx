import "react-native-gesture-handler";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSansKR: require("@/assets/fonts/NotoSansKR-VF.ttf"),
  });

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

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
            <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
            </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>

  );
}
