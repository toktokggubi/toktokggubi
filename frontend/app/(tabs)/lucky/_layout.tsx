// app/(tabs)/lucky/_layout.tsx
import { Stack } from "expo-router";

export default function LuckyStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index, nbbang, molbbang 모두 이 Stack 아래에서 렌더 */}
      <Stack.Screen name="index" />
      <Stack.Screen
        name="molbbang"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
