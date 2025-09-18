import React, { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { s } from "./variants";

export function FormPage({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={s.root}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.center}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
