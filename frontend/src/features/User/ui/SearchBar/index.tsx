import React, { memo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SearchBarProps } from "./types";
import { colors } from "@/shared/constants/colors";

function SearchBarImpl({
  value,
  placeholder,
  onChangeText,
  onClear,
  onSubmit,
}: SearchBarProps) {
  const handleSubmit = () => {
    onSubmit?.(value);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    onClear?.(); // 상위에서 query = "" 같은 거 실행
  };

  return (
    <View style={s.wrap}>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "찾으시는 기프티콘을 입력해주세요"}
        placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
        selectionColor={colors.BLUE_NORMAL}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        blurOnSubmit
      />

      {value?.length > 0 ? (
        // ✅ 값이 있으면 X 버튼
        <Pressable onPress={handleClear} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.BLUE_LIGHT_ACTIVE} />
        </Pressable>
      ) : (
        // ✅ 값이 없으면 '검색' 텍스트 버튼
        <Pressable onPress={handleSubmit} hitSlop={8}>
          <Text style={s.searchLabel}>검색</Text>
        </Pressable>
      )}
    </View>
  );
}

export const SearchBar = memo(SearchBarImpl);

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.BLUE_LIGHT,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.BLUE_LIGHT_ACTIVE,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.BLUE_DARKER,
    lineHeight: 18,
    textAlignVertical: "center",
    includeFontPadding: false as unknown as boolean,
    minHeight: 0,
  },
});
