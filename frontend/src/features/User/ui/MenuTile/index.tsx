import React, { memo } from "react";
import { Pressable, Image, Text, StyleSheet } from "react-native";
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
    // Android 그림자
    elevation: 2,
  },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.5 },
  image: { width: 72, height: 72, resizeMode: "contain", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
});

export default memo(MenuTileImpl);
