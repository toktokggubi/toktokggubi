import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
  TextInputKeyPressEventData,
} from "react-native";
import { colors } from "@/shared/constants/colors";
import type { AddFixedExpenseFormProps } from "./types";
import { formTitle, fieldLabels } from "./variants";
import { onlyNum } from "~features/Budget/utils/currency";

type Sel = { start: number; end: number };

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

  // ✅ 커서 selection을 “완전 제어” (사용자 이동 허용하되 단위 영역은 clamp)
  const [amountSel, setAmountSel] = useState<Sel | undefined>(undefined);
  const [daySel, setDaySel] = useState<Sel | undefined>(undefined);

  // 표시 문자열
  const displayAmount = useMemo(
    () => (amount > 0 ? `${amount.toLocaleString("ko-KR")} 원` : ""),
    [amount]
  );
  const displayBillingDay = useMemo(
    () => (billingDay ? `${billingDay} 일` : ""),
    [billingDay]
  );

  const beforeUnitIdxAmt = Math.max(0, displayAmount.length - 2); // " 원" 앞
  const beforeUnitIdxDay = Math.max(0, displayBillingDay.length - 2); // " 일" 앞

  // clamp 유틸 (단위 영역 진입 방지)
  const clampBeforeUnit = (pos: number, limit: number) => Math.min(pos, limit);

  const clampSelection = (sel: Sel, limit: number): Sel => ({
    start: clampBeforeUnit(sel.start, limit),
    end: clampBeforeUnit(sel.end, limit),
  });

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

  useEffect(() => {
    if (displayAmount)
      setAmountSel({ start: beforeUnitIdxAmt, end: beforeUnitIdxAmt });
    else setAmountSel(undefined);
  }, [displayAmount, beforeUnitIdxAmt]);

  useEffect(() => {
    if (displayBillingDay)
      setDaySel({ start: beforeUnitIdxDay, end: beforeUnitIdxDay });
    else setDaySel(undefined);
  }, [displayBillingDay, beforeUnitIdxDay]);

  const submit = () => {
    if (!name || !amount) return; // 최소 검증
    onSubmit({
      name,
      amount,
      includeInBudget: include,
      billingDay: billingDay ? Number(billingDay) : undefined,
    });
  };

  // 공통 selection 변경 핸들러 (사용자 이동 허용 + 단위 앞 클램프)
  const onSelChangeAmount = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    const next = clampSelection(e.nativeEvent.selection, beforeUnitIdxAmt);
    setAmountSel(next);
  };
  const onSelChangeDay = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    const next = clampSelection(e.nativeEvent.selection, beforeUnitIdxDay);
    setDaySel(next);
  };

  // 백스페이스 시 단위를 지우려 들면 커서를 단위 앞에 고정
  const onKeyAmt = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Backspace" && displayAmount) {
      if (!amountSel) return;
      const clampIdx = beforeUnitIdxAmt;
      // 커서가 단위 영역(>= clampIdx)이라면 보정
      if (amountSel.start >= clampIdx && amountSel.end >= clampIdx) {
        setAmountSel({ start: clampIdx, end: clampIdx });
      }
    }
  };
  const onKeyDay = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Backspace" && displayBillingDay) {
      if (!daySel) return;
      const clampIdx = beforeUnitIdxDay;
      if (daySel.start >= clampIdx && daySel.end >= clampIdx) {
        setDaySel({ start: clampIdx, end: clampIdx });
      }
    }
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
        value={displayAmount}
        onChangeText={(t) => {
          setAmount(onlyNum(t)); // 숫자만 유지
          // 다음 렌더에서 useEffect가 단위 앞 위치로 보정
        }}
        onSelectionChange={onSelChangeAmount}
        selection={amountSel}
        onKeyPress={onKeyAmt}
        onFocus={() => {
          if (displayAmount)
            setAmountSel({ start: beforeUnitIdxAmt, end: beforeUnitIdxAmt });
        }}
        keyboardType="number-pad"
        inputMode="numeric"
        placeholder="예: 500,000 원"
      />

      <Text style={s.label}>{fieldLabels.billingDay}</Text>
      <TextInput
        style={s.input}
        value={displayBillingDay}
        onChangeText={(t) => {
          const num = t.replace(/\D/g, "");
          setBillingDay(num);
        }}
        onSelectionChange={onSelChangeDay}
        selection={daySel}
        onKeyPress={onKeyDay}
        onFocus={() => {
          if (displayBillingDay)
            setDaySel({ start: beforeUnitIdxDay, end: beforeUnitIdxDay });
        }}
        keyboardType="number-pad"
        placeholder="1~31 일"
      />

      <View style={s.inline}>
        <Text>{fieldLabels.include}</Text>
        <Pressable
          onPress={() => setInclude((v) => !v)}
          style={[s.checkbox, include && s.checkboxOn]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: include }}
        >
          {include ? <Text style={s.checkMark}>✓</Text> : null}
        </Pressable>
      </View>

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
