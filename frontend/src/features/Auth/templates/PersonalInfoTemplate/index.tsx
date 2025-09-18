import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Button from "~features/Auth/ui/Button";
import InputField from "~features/Auth/ui/InputField";
import type { PersonalInfoTemplateProps } from "./types";

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
  isSubmitting = false,
  nicknameHelperText,
  incomeHelperText,
  rightLabel = "만원",
  headerImageSource,
}: PersonalInfoTemplateProps) {
  return (
    <KeyboardAvoidingView 
      style={style.wrap}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={style.container}>
            <View>
              {headerImageSource && (
                <Image
                  source={headerImageSource}
                  resizeMode="contain"
                  style={{ width: 150, height: 100, marginLeft: -20 }}
                />
              )}
            </View>
            <View style={style.introWrap}>
              <Text style={style.introNormal}>안전한 </Text>
              <Text style={style.introBold}>똑똑꺼비</Text>
              <Text style={style.introNormal}>와 함께</Text>
            </View>
            <View style={[style.introWrap]}>
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

        {/* 직업 (BottomSheet 오픈) */}
        <PressField
          label="직업"
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
          rightLabel={rightLabel}
        />

              <Button value="저장" onPress={onSubmit} disabled={isSubmitting} />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    alignItems: "baseline",
  },
  introBold: {
    fontSize: 24,
    ...font.bold,
    lineHeight: 45,
    color: "#0E3159",
  },
  introNormal: {
    fontSize: 24,
    fontWeight: "200",
    color: "#0E3159",
  },
  wrap: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    paddingTop: 60,
  },
  container: {
    padding: 16,
    paddingBottom: 20,
  },
  title: { fontSize: 20, ...font.bold, marginBottom: 16 },
  label: { fontSize: 14, color: "#334155", marginBottom: 6 },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    
    borderRadius: 999,
  },
  chipText: { color: "#0F172A", ...font.medium },
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
