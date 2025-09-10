import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
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
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  );
}
