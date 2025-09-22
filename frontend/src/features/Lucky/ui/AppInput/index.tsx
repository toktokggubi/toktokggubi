import React, { memo } from "react";
import {
  View,
  Text,
  TextInput,
  type TextInputProps,
  StyleSheet,
} from "react-native";

export interface AppInputProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  label?: string;
  // any 금지: 명시적으로!
  value: string;
  onChangeText: NonNullable<TextInputProps["onChangeText"]>;
}

function AppInputImpl({ label, style, ...inputProps }: AppInputProps) {
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        {...inputProps}
        style={[s.input, style]}
        accessibilityLabel={label ?? inputProps.placeholder}
      />
    </View>
  );
}

export const AppInput = memo(AppInputImpl);

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { marginBottom: 6, color: "#1F3D6D", fontWeight: "600" },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E3E9F5",
  },
});
