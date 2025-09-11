// app/(tabs)/mypage/_layout.tsx
import { Stack } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BG = "#F8FBFF";
const TXT = "#0f172a";
const ACCENT = "#246BFD";

export default function MyPageStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="cards/index"
        options={{
          headerShown: true,
          title: "나의 카드",
          headerTitleAlign: "center",
          headerTintColor: TXT,
          headerStyle: { backgroundColor: BG },
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: "800" },
        }}
      />
      <Stack.Screen
        name="gifticons/index"
        options={{
          headerShown: true,
          title: "나의 기프티콘",
          headerTitleAlign: "center",
          headerTintColor: TXT,
          headerStyle: { backgroundColor: BG },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerBtn: { paddingHorizontal: 12, paddingVertical: 6 },
});
