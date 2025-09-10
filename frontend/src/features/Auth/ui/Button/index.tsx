import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ButtonProps } from "./types";

const Button = ({
  value,
  variant = "default",
  onPress,
  icon,
  disabled,
}: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[style.base, style[variant], disabled && style.disabled]}
    >
      <View style={style.content}>
        {icon && <View style={style.icon}>{icon}</View>}
        <Text
          style={[
            style.text,
            style[`${variant}Text`],
            disabled && style.disabledText,
          ]}
        >
          {value}
        </Text>
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
  //비활성화
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
