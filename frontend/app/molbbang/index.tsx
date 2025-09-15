import React, { useCallback } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { router } from "expo-router";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export default function MolbbangHomeScreen() {
  const goCreate = useCallback(() => router.push("/molbbang/create"), []);
  const goJoin = useCallback(() => router.push("/molbbang/join"), []);

  return (
    <View style={s.container}>
      <Text style={[s.h1, font.bold]}>몰빵</Text>
      <View style={{ height: 16 }} />
      <Pressable style={[s.btn, s.primary]} onPress={goCreate}>
        <Text style={[s.btnTxt, s.primaryTxt]}>방 만들기</Text>
      </Pressable>
      <View style={{ height: 12 }} />
      <Pressable style={s.btn} onPress={goJoin}>
        <Text style={s.btnTxt}>코드로 참가</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FBFF",
  },
  h1: { fontSize: 22, color: colors.BLUE_DARKER },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.GRAY_LIGHT,
  },
  btnTxt: { fontSize: 16, color: colors.BLUE_DARKER, ...font.medium },
  primary: { backgroundColor: colors.BLUE_NORMAL },
  primaryTxt: { color: "white" },
});
