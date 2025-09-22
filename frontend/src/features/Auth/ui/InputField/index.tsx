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
      rightLabel,
      variant = "default",
      passwordToggle,
      onTogglePassword,
      secureTextEntry,
      placeholderTextColor,
      error,
      ...rest
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const v = inputFieldVariants[variant];

    const handleTogglePassword = () => {
      setIsPasswordVisible(!isPasswordVisible);
      onTogglePassword?.();
    };

    return (
      <View style={styles.container}>
        {topLabel ? (
          <Text
            style={[styles.topLabel, variant === "default" && { color: "#ff" }]}
          >
            {topLabel}
          </Text>
        ) : null}
        <View style={[styles.inputWrapper, v.wrapper, error && styles.errorWrapper]}>
          <TextInput
            ref={ref}
            style={[styles.input, v.input, error && styles.errorInput]}
            placeholderTextColor={placeholderTextColor ?? v.placeholder.color}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            {...rest}
          />
          {rightLabel && (
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          )}
          {secureTextEntry && (
            <TouchableOpacity
              onPress={handleTogglePassword}
              style={styles.eyeBtn}
            >
              <Text style={{ opacity: 0.5 }}>{isPasswordVisible ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : bottomLabel ? (
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
    borderColor: "#E2E8F0",
  },
  errorWrapper: {
    borderColor: "#EF4444",
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  errorInput: {
    color: "#EF4444",
  },
  eyeBtn: { padding: 6, marginLeft: 4 },
  bottomLabel: {
    marginTop: 4,
    paddingHorizontal: 16,
    fontSize: 12,
    color: "#D2D3D7",
  },
  errorText: {
    marginTop: 4,
    paddingHorizontal: 16,
    fontSize: 12,
    color: "#EF4444",
  },
  topLabel: {
    marginBottom: 4,
  },
  rightLabel: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 8,
  },
});

export default InputField;
