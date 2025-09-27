import { Stack } from "expo-router";
import React from "react";

export default function MolbbangLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="join" options={{ headerShown: false }} />
      <Stack.Screen name="room/[code]" options={{ headerShown: false }} />
    </Stack>
  );
}
