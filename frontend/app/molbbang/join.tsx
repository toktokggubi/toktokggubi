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

export default function MolbbangJoinScreen() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("참가자");

  const handleJoin = useCallback(async () => {
    if (code.length < 4) return Alert.alert("코드를 정확히 입력해줘!");
    const upper = code.trim().toUpperCase();

    const res = await molbbangApi.joinRoom({ code: upper, nickname });
    if (!res.ok) return Alert.alert("입장 실패");
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: {
        code: upper,
        nick: nickname, // 쿼리 파라미터로 안전하게 전달
      },
    });
  }, [code, nickname]);

  return (
    <View style={s.container}>
      <Text style={[s.h1, font.bold]}>코드로 참가</Text>
      <TextInput
        style={s.input}
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />
      <TextInput
        style={s.input}
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="초대 코드(대문자)"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />
      <Pressable style={[s.btn, s.primary]} onPress={handleJoin}>
        <Text style={[s.btnTxt, s.primaryTxt]}>입장</Text>
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
