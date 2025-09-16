import Button from "@/features/Auth/ui/Button";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { HomeScreen } from "@/features/Home/screens/HomeScreen";

export default function HomeTabScreen() {
  return (
    <View style={s.container}>
      <HomeScreen />
      
      {/* 임시 버튼들 - 나중에 제거 예정 */}
      <View style={s.buttonContainer}>
        <Button
          value="로그인 화면으로!!"
          onPress={() => router.push("/auth/login")}
        />

        <Button value="예산 설정 시작" onPress={() => router.push("/budget")} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
