import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { InputFieldProps, InputFieldRef } from "./types";
import { inputFieldVariants } from "./variants";

const InputField = forwardRef<InputFieldRef, InputFieldProps>(
  (
    {
      topLabel,
      bottomLabel,
      variant = "default",
      passwordToggle,
      secureTextEntry,
      placeholderTextColor,
      ...rest
    },
    ref
  ) => {
    const [hidden, setHidden] = useState<boolean>(!!secureTextEntry);
    const v = inputFieldVariants[variant];

    return (
      <View style={styles.container}>
        {topLabel ? (
          <Text
            style={[styles.topLabel, variant === "default" && { color: "#ff" }]}
          >
            {topLabel}
          </Text>
        ) : null}
        <View style={[styles.inputWrapper, v.wrapper]}>
          <TextInput
            ref={ref}
            style={[styles.input, v.input]}
            placeholderTextColor={placeholderTextColor ?? v.placeholder.color}
            secureTextEntry={passwordToggle ? hidden : secureTextEntry}
            {...rest}
          />
          {passwordToggle && (
            <TouchableOpacity
              onPress={() => setHidden((p) => !p)}
              style={styles.eyeBtn}
            >
              <Text style={{ opacity: 0.5 }}>{hidden ? "👁️‍🗨️" : "👁️"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {bottomLabel ? (
          <Text
            style={[
              styles.bottomLabel,
              variant === "default" && { color: "#D2D3D7" },
            ]}
          >
            {bottomLabel}
          </Text>
        ) : null}
      </View>
    );
  }
);

InputField.displayName = "InputField";

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  eyeBtn: { padding: 6, marginLeft: 4 },
  bottomLabel: {
    marginTop: 4,
    paddingHorizontal: 16,
    fontSize: 12,
    color: "#D2D3D7",
  },
  topLabel: {
    marginBottom: 4,
  },
});

export default InputField;
