import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ButtonProps } from "./types";

const Button = ({ value, variant = "default", onPress, icon }: ButtonProps) => {
  return (
    <Pressable onPress={onPress} style={[style.base, style[variant]]}>
      <View style={style.content}>
        {icon && <View style={style.icon}>{icon}</View>}
        <Text style={[style.text, style[`${variant}Text`]]}>{value}</Text>
      </View>
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
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  defaultText: {
    color: "#fff",
  },
  kakaoButtonText: {
    color: "#313339",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
