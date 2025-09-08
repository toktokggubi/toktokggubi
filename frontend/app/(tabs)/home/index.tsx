import Button from "@/features/Auth/ui/Button";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={s.container}>
      <Button
        value="로그인 화면으로"
        onPress={() => router.push("/auth/login")}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
