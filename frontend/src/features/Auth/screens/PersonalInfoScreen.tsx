import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import AppBottomSheet from "~features/Auth/ui/BottomSheetList";
import PersonalInfoTemplate from "../templates/PersonalInfoTemplate";
import { useRouter } from "expo-router";

const AGE_GROUP_OPTIONS = [
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대 이상",
] as const;
const JOB_TITLE_OPTIONS = [
  "개발자",
  "디자이너",
  "기획자",
  "마케터",
  "데이터 분석가",
  "기타",
];

const router = useRouter();

export default function PersonalInfoScreen() {
  // 입력 상태 (문자열로 유지 → 제출 시 숫자 변환)
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [ageGroup, setAgeGroup] = useState<
    `${(typeof AGE_GROUP_OPTIONS)[number]}` | ""
  >("");
  const [jobTitle, setJobTitle] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  // BottomSheet refs
  const ageSheetRef = useRef<BottomSheet>(null);
  const jobSheetRef = useRef<BottomSheet>(null);

  const openAgeSheet = () => ageSheetRef.current?.snapToIndex(0);
  const openJobSheet = () => jobSheetRef.current?.snapToIndex(0);

  const closeAgeSheet = () => ageSheetRef.current?.close();
  const closeJobSheet = () => jobSheetRef.current?.close();

  // 제출
  const handleSubmit = () => {
    const data = {
      nickname: (nickname ?? "").trim(),
      gender,
      ageGroup: (ageGroup || "").trim(),
      jobTitle: (jobTitle || "").trim(),
      monthlyIncome: Number((monthlyIncome || "0").replace(/[^0-9]/g, "")),
    };

    // 간단 검증
    if (!data.nickname) return Alert.alert("알림", "닉네임을 입력해 주세요.");
    if (!data.ageGroup) return Alert.alert("알림", "연령대를 선택해 주세요.");
    if (!data.jobTitle) return Alert.alert("알림", "직무를 선택해 주세요.");
    if (!data.monthlyIncome || isNaN(data.monthlyIncome))
      return Alert.alert("알림", "월 소득을 숫자로 입력해 주세요.");

    Alert.alert("OK", JSON.stringify(data, null, 2));
  };

  const renderOption = (
    label: string,
    onPick: (v: string) => void,
    onClose: () => void
  ) =>
    function Item({ item }: { item: string }) {
      return (
        <TouchableOpacity
          onPress={() => {
            onPick(item);
            onClose();
          }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: "#E2E8F0",
          }}
        >
          <Text style={{ fontSize: 16 }}>{item}</Text>
        </TouchableOpacity>
      );
    };

  const AgeItem = useMemo(
    () =>
      renderOption(
        "연령대",
        (v: string) => setAgeGroup(v as any),
        closeAgeSheet
      ),
    []
  );
  const JobItem = useMemo(
    () => renderOption("직무", (v: string) => setJobTitle(v), closeJobSheet),
    []
  );

  const onNavigateWelcome = () => {
    router.push("/auth/welcome");
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <PersonalInfoTemplate
        nickname={nickname}
        gender={gender}
        ageGroup={ageGroup}
        jobTitle={jobTitle}
        monthlyIncome={monthlyIncome}
        onChangeNickname={setNickname}
        onChangeGender={setGender}
        onPressAgeGroup={openAgeSheet}
        onPressJobTitle={openJobSheet}
        onChangeMonthlyIncome={setMonthlyIncome}
        onSubmit={onNavigateWelcome}
      />
      {/* 연령대 시트 */}
      <AppBottomSheet ref={ageSheetRef} snapPoints={["40%"]} initialIndex={-1}>
        <BottomSheetFlatList
          data={AGE_GROUP_OPTIONS as unknown as string[]}
          keyExtractor={(i) => i}
          renderItem={AgeItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </AppBottomSheet>
      {/* 직무 시트 */}
      <AppBottomSheet ref={jobSheetRef} snapPoints={["40%"]} initialIndex={-1}>
        <BottomSheetFlatList
          data={JOB_TITLE_OPTIONS}
          keyExtractor={(i) => i}
          renderItem={JobItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </AppBottomSheet>
    </SafeAreaView>
  );
}
