import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { GifticonFormProps } from "./types";

export function GifticonForm({
  merchant,
  onMerchantChange,
  label,
  onLabelChange,
  expiresAt,
  onExpiresAtChange,
  onSubmit,
  disabled = false,
}: GifticonFormProps) {
  return (
    <View>
      <Text style={s.label}>사용처</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.inputField}
          placeholder="예) 스타벅스 / BHC"
          value={merchant}
          onChangeText={onMerchantChange}
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          textAlignVertical="center"
        />
      </View>

      <Text style={s.label}>종류</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.inputField}
          placeholder="상품명"
          value={label}
          onChangeText={onLabelChange}
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          textAlignVertical="center"
        />
      </View>

      <Text style={s.label}>유효기간</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.inputField}
          placeholder="YYYY-MM-DD"
          value={expiresAt}
          onChangeText={onExpiresAtChange}
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          keyboardType="numbers-and-punctuation"
          textAlignVertical="center"
        />
      </View>

      <Pressable
        style={[s.btn, disabled && s.btnDisabled]}
        onPress={onSubmit}
        disabled={disabled}
      >
        <Text style={s.btnTxt}>등록하기</Text>
      </Pressable>
    </View>
  );
}

const ROW_H = 44;

const s = StyleSheet.create({
  label: {
    color: colors.BLUE_DARKER,
    ...font.bold,
    marginBottom: 6,
    marginTop: 8,
  },
  // ✅ 컨테이너가 높이/스타일을 책임
  inputRow: {
    height: ROW_H,
    flexDirection: "row",
    alignItems: "center", // 세로 중앙
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
    marginBottom: 10,
  },
  // ✅ TextInput은 유연하게만 (minHeight 0로 안드 기본값 제거)
  inputField: {
    flex: 1,
    fontSize: 16,
    color: colors.BLUE_DARKER,
    paddingVertical: 0,
    margin: 0,
    minHeight: 0, // 안드 기본 minHeight 제거
    ...(Platform.OS === "android" ? { letterSpacing: 0.2 } : null),
  },
  btn: {
    marginTop: 12,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.BLUE_NORMAL,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: "#fff", ...font.bold },
});
