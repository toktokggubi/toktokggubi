import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { ButtonProps } from "./types";

const Button = ({ value, variant = "default", onPress }: ButtonProps) => {
  return (
    <Pressable onPress={onPress} style={[style.base, style[variant]]}>
      <Text style={style.text}>{value}</Text>
    </Pressable>
  );
};

const style = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  default: {
    backgroundColor: "#6F94FF",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Button;
