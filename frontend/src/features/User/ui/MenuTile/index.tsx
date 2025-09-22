import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import type { MenuTileProps } from "./types";

function MenuTileImpl({ label, image, onPress, disabled }: MenuTileProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.tile,
        pressed && !disabled && s.pressed,
        disabled && s.disabled,
      ]}
      android_ripple={{ borderless: false }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Image source={image} style={s.image} />
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 120,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // 마이페이지 다른 요소들과 통일된 그림자 스타일
    shadowColor: colors.BLUE_LIGHT_ACTIVE,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.5 },
  image: { width: 72, height: 72, resizeMode: "contain", marginBottom: 10 },
  label: { fontSize: 14, ...font.bold, color: "#1f2937" },
});

export default memo(MenuTileImpl);
