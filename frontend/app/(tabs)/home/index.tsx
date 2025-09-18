import { StyleSheet, View } from "react-native";
import { HomeScreen } from "@/features/Home/screens/HomeScreen";

export default function HomeTabScreen() {
  return (
    <View style={s.container}>
      <HomeScreen />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
});
