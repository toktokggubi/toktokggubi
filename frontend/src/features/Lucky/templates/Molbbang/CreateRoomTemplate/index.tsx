// src/features/Lucky/templates/Molbbang/CreateRoomTemplate/index.tsx
import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { s } from "./variants";
import type { CreateRoomTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { AppHeader } from "@/shared/ui/AppHeader"; // ✅ 공통 헤더 import

export default function CreateRoomTemplate({
  nickname,
  amount,
  onChangeNickname,
  onChangeAmount,
  onSubmit,
}: CreateRoomTemplateProps) {
  return (
    <View style={s.container}>
      {/* 🔹 CardScreen 스타일 헤더 */}
      <AppHeader title="몰빵" />

      {/* 🔹 본문 내용 */}
      <Text style={s.h1}>방 만들기</Text>
      <TextInput
        style={s.input}
        value={nickname}
        onChangeText={onChangeNickname}
        placeholder="닉네임"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />
      <TextInput
        style={s.input}
        value={amount}
        onChangeText={onChangeAmount}
        keyboardType="number-pad"
        placeholder="몰빵 금액(원)"
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
      />
      <Pressable style={s.btn} onPress={onSubmit}>
        <Text style={s.btnTxt}>생성</Text>
      </Pressable>
    </View>
  );
}
