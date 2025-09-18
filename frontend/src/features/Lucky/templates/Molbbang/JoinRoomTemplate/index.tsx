import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { s } from "./variants";
import type { JoinRoomTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { AppHeader } from "@/shared/ui/AppHeader"; // ✅ 공통 헤더

export default function JoinRoomTemplate({
  nickname,
  code,
  onChangeNickname,
  onChangeCode,
  onSubmit,
}: JoinRoomTemplateProps) {
  return (
    <View style={s.container}>
      {/* ✅ CardScreen 스타일 헤더 */}
      <AppHeader title="몰빵" />

      {/* ✅ 본문 */}
      <Text style={s.h1}>코드로 참가</Text>

      <TextInput
        style={s.input}
        value={nickname}
        onChangeText={onChangeNickname}
        placeholder="닉네임"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />

      <TextInput
        style={s.input}
        value={code}
        onChangeText={onChangeCode}
        autoCapitalize="characters"
        placeholder="초대 코드(대문자)"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />

      <Pressable style={s.btn} onPress={onSubmit}>
        <Text style={s.btnTxt}>입장</Text>
      </Pressable>
    </View>
  );
}
