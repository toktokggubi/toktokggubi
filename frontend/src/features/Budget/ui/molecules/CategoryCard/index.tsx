import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CategoryCardProps } from "./types";

function CategoryCard({
  name,
  label,
  icon,
  selected = false,
  disabled = false,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable
      onPress={() => !disabled && onPress?.(name)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconWrap}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          disabled && styles.labelDisabled,
        ]}
        numberOfLines={2}
        textAlign="center"
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default memo(CategoryCard);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 116,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#DDE3F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selected: {
    borderColor: colors.BLUE_NORMAL,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { width: 56, height: 56 },
  label: { fontSize: 14, ...font.medium, color: "#262B31", lineHeight: 18 },
  labelSelected: { color: colors.BLUE_NORMAL },
  labelDisabled: { color: "#97A1AF" },
});
