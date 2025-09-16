import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export default function MolbbangCreateScreen() {
  const [amount, setAmount] = useState<string>("");
  const [nickname, setNickname] = useState<string>("호스트");

  const handleCreate = useCallback(async () => {
    const money = Number(amount);
    if (!money || money < 100)
      return Alert.alert("금액은 100원 이상 입력해줘!");
    const res = await molbbangApi.createRoom({ amount: money, nickname });
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: {
        code: res.code,
        amount: String(money),
        nick: nickname,
      },
    });
  }, [amount, nickname]);

  return (
    <View style={s.container}>
      <Text style={[s.h1, font.bold]}>방 만들기</Text>
      <TextInput
        style={s.input}
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />
      <TextInput
        style={s.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        placeholder="몰빵 금액(원)"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />
      <Pressable style={[s.btn, s.primary]} onPress={handleCreate}>
        <Text style={[s.btnTxt, s.primaryTxt]}>생성</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF", padding: 16 },
  h1: { fontSize: 20, color: colors.BLUE_DARKER, marginBottom: 16 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
  },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnTxt: { fontSize: 16, ...font.medium },
  primary: { backgroundColor: colors.BLUE_NORMAL },
  primaryTxt: { color: "white" },
});
