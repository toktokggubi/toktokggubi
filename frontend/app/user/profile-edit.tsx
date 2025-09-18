import ProfileEditScreen from "@/features/User/screens/ProfileEditScreen";
import { Stack } from "expo-router";

export default function ProfileEditPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ProfileEditScreen />
    </>
  );
}
