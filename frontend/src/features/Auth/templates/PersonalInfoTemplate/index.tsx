import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { PersonalInfoTemplateProps } from "./types";
import InputField from "~features/Auth/ui/InputField";
import Button from "~features/Auth/ui/Button";
import { colors } from "@/shared/constants/colors";

export default function PersonalInfoTemplate({
  nickname,
  gender,
  ageGroup,
  jobTitle,
  monthlyIncome,
  onChangeNickname,
  onChangeGender,
  onPressAgeGroup,
  onPressJobTitle,
  onChangeMonthlyIncome,
  onSubmit,
  nicknameHelperText,
  incomeHelperText,
}: PersonalInfoTemplateProps) {
  return (
    <View style={style.wrap}>
      <View style={style.introWrap}>
        <Text style={style.introNormal}>안전한 </Text>
        <Text style={style.introBold}>똑똑꺼비</Text>
        <Text style={style.introNormal}>와 함께</Text>
      </View>
      <View style={style.introWrap}>
        <Text style={style.introBold}>개인정보</Text>
        <Text style={style.introNormal}>를 입력해주세요!</Text>
      </View>
      <View style={{ marginTop: 24 }}>
        {/* 닉네임 */}
        <InputField
          placeholder="닉네임"
          value={nickname ?? ""}
          onChangeText={onChangeNickname}
          bottomLabel={nicknameHelperText}
          returnKeyType="next"
          topLabel="닉네임"
        />

        {/* 성별 (토글) */}
        <View style={{ marginBottom: 12 }}>
          <Text style={style.label}>성별</Text>
          <View style={style.row}>
            <ToggleChip
              label="남성"
              active={gender === "M"}
              onPress={() => onChangeGender("M")}
            />
            <ToggleChip
              label="여성"
              active={gender === "F"}
              onPress={() => onChangeGender("F")}
            />
          </View>
        </View>

        {/* 연령대 (BottomSheet 오픈) */}
        <PressField
          label="연령대"
          value={ageGroup || "선택하세요"}
          onPress={onPressAgeGroup}
        />

        {/* 직무 (BottomSheet 오픈) */}
        <PressField
          label="직무"
          value={jobTitle || "선택하세요"}
          onPress={onPressJobTitle}
        />

        {/* 월 소득 */}
        <InputField
          placeholder="월 소득 (숫자)"
          value={monthlyIncome ?? ""}
          onChangeText={onChangeMonthlyIncome}
          keyboardType="numeric"
          bottomLabel={incomeHelperText}
          returnKeyType="done"
          topLabel="월 소득"
        />

        <Button value="저장" onPress={onSubmit} />
      </View>
    </View>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        style.chip,
        active
          ? { backgroundColor: colors.BLUE_NORMAL }
          : { backgroundColor: "#F1F5F9" },
      ]}
    >
      <Text style={[style.chipText, active && { color: "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PressField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={style.label}>{label}</Text>
      <TouchableOpacity onPress={onPress} style={style.pressField}>
        <Text style={[style.pressFieldText, !value && { color: "#94A3B8" }]}>
          {value || "선택하세요"}
        </Text>
        <Text style={{ opacity: 0.6 }}>▾</Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  introWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  introBold: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0E3159",
  },
  introNormal: {
    fontSize: 24,
    fontWeight: "200",
    color: "#0E3159",
  },
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F8FBFF",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, color: "#334155", marginBottom: 6 },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { color: "#0F172A", fontWeight: "600" },
  pressField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  pressFieldText: { fontSize: 16, color: "#0F172A" },
});
