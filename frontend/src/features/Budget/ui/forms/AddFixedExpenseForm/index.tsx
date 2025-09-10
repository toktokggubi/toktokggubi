import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import type { AddFixedExpenseFormProps } from "./types";
import { formTitle, fieldLabels } from "./variants";

export default function AddFixedExpenseForm({
  mode = "create",
  defaultValues,
  onSubmit,
  onCancel,
}: AddFixedExpenseFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [amount, setAmount] = useState<number>(defaultValues?.amount ?? 0);
  const [include, setInclude] = useState(
    defaultValues?.includeInBudget ?? true
  );
  const [billingDay, setBillingDay] = useState<string>(
    defaultValues?.billingDay ? String(defaultValues.billingDay) : ""
  );

  // defaultValues 변경 대응
  useEffect(() => {
    if (!defaultValues) return;
    setName(defaultValues.name ?? "");
    setAmount(defaultValues.amount ?? 0);
    setInclude(defaultValues.includeInBudget ?? true);
    setBillingDay(
      defaultValues.billingDay ? String(defaultValues.billingDay) : ""
    );
  }, [defaultValues]);

  const submit = () => {
    if (!name || !amount) return; // 최소 검증
    onSubmit({
      name,
      amount,
      includeInBudget: include,
      billingDay: billingDay ? Number(billingDay) : undefined,
    });
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>{formTitle(mode)}</Text>

      <Text style={s.label}>{fieldLabels.name}</Text>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="예: 월세"
      />

      <Text style={s.label}>{fieldLabels.amount}</Text>
      <TextInput
        style={s.input}
        value={amount ? amount.toString() : ""}
        onChangeText={(v) => setAmount(Number(v.replaceAll(",", "")) || 0)}
        keyboardType="numeric"
        placeholder="예: 500000"
      />

      <View style={s.inline}>
        <Pressable
          onPress={() => setInclude((v) => !v)}
          style={[s.checkbox, include && s.checkboxOn]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: include }}
        >
          {include ? <Text style={s.checkMark}>✓</Text> : null}
        </Pressable>
        <Text>{fieldLabels.include}</Text>
      </View>

      <Text style={s.label}>{fieldLabels.billingDay}</Text>
      <TextInput
        style={s.input}
        value={billingDay}
        onChangeText={setBillingDay}
        keyboardType="number-pad"
        placeholder="1~31"
      />

      <View style={s.actions}>
        {onCancel ? (
          <Pressable onPress={onCancel} style={[s.btn, s.ghost]}>
            <Text>취소</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={submit} style={[s.btn, s.primary]}>
          <Text style={s.submitTxt}>{fieldLabels.submit(mode)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inline: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.BLUE_NORMAL,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.BLUE_NORMAL },
  checkMark: { color: "#fff", fontWeight: "700" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 8,
  },
  btn: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: colors.BLUE_NORMAL },
  ghost: { backgroundColor: "#E9EEFF" },
  submitTxt: { color: "#fff", fontWeight: "700" },
});
