import React from "react";
import { TextInput } from "react-native";
import { s } from "./variants";
import type { TextInputProps } from "react-native";

export function AppInput(props: TextInputProps) {
  return <TextInput style={s.input} {...props} />;
}
