import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import type { ButtonProps } from "./types";

const Button = ({ children }: ButtonProps) => {
  return (
    <Pressable>
      <Text>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // 필요한 스타일 직접 정의
});

export default Button;
