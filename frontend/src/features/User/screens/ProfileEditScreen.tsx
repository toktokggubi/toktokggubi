import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Keyboard,
} from "react-native";
import type BottomSheet from "@gorhom/bottom-sheet";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import AppBottomSheet from "@/features/Auth/ui/BottomSheetList";
import PersonalInfoTemplate from "@/features/Auth/templates/PersonalInfoTemplate";
import { useRouter } from "expo-router";
import { useUpdateProfile, useProfileQuery } from "@/features/Auth/model/useAuthQueries";

const AGE_GROUP_OPTIONS = [
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대 이상",
] as const;
const JOB_TITLE_OPTIONS = [
  "직장인",
  "전문직",
  "공무원",
  "자영업",
  "학생",
  "주부",
  "무직",
  "프리랜서",
  "군인",
  "농업인",
  "기타",
];

const router = useRouter();

export default function ProfileEditScreen() {
  // 현재 프로필 데이터 가져오기
  const { data: profileData, isLoading } = useProfileQuery();
  
  // 입력 상태 (문자열로 유지 → 제출 시 숫자 변환)
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [ageGroup, setAgeGroup] = useState<
    `${(typeof AGE_GROUP_OPTIONS)[number]}` | ""
  >("");
  const [jobTitle, setJobTitle] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const updateProfileMutation = useUpdateProfile();

  // BottomSheet refs
  const ageSheetRef = useRef<BottomSheet>(null);
  const jobSheetRef = useRef<BottomSheet>(null);

  // 프로필 데이터가 로드되면 폼에 채우기
  useEffect(() => {
    if (profileData) {
      console.log("Profile data loaded:", profileData);
      setNickname(profileData.nickname || "");
      setGender(profileData.gender as "M" | "F");
      setAgeGroup(profileData.ageGroup as any || "");
      setJobTitle(profileData.jobTitle || "");
      // API에서 받아온 데이터를 그대로 사용 (만원 단위)
      setMonthlyIncome(profileData.monthlyIncome?.toString() || "0");
    }
  }, [profileData]);

  const openAgeSheet = () => {
    Keyboard.dismiss(); // 키보드가 열려있으면 먼저 닫기
    ageSheetRef.current?.snapToIndex(0);
  };
  const openJobSheet = () => {
    Keyboard.dismiss(); // 키보드가 열려있으면 먼저 닫기
    jobSheetRef.current?.snapToIndex(0);
  };

  const closeAgeSheet = () => ageSheetRef.current?.close();
  const closeJobSheet = () => jobSheetRef.current?.close();

  // 키보드가 숨겨질 때 바텀시트도 닫기
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      closeAgeSheet();
      closeJobSheet();
    });

    return () => {
      keyboardDidHideListener?.remove();
    };
  }, []);

  // 제출
  const handleSubmit = async () => {
    const inputIncome = Number((monthlyIncome || "0").replace(/[^0-9]/g, ""));
    
    console.log("Input income (만원):", inputIncome);
    
    const data = {
      nickname: (nickname ?? "").trim(),
      ageGroup: (ageGroup || "").trim(),
      jobTitle: (jobTitle || "").trim(),
      monthlyIncome: inputIncome,
    };

    // 간단 검증
    if (!data.nickname) return Alert.alert("알림", "닉네임을 입력해 주세요.");
    if (!data.ageGroup) return Alert.alert("알림", "연령대를 선택해 주세요.");
    if (!data.jobTitle) return Alert.alert("알림", "직업을 선택해 주세요.");
    if (!data.monthlyIncome || isNaN(data.monthlyIncome))
      return Alert.alert("알림", "월 소득을 숫자로 입력해 주세요.");

    try {
      await updateProfileMutation.mutateAsync(data);
      Alert.alert("성공", "프로필이 수정되었습니다.", [
        { text: "확인", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("프로필 수정 실패:", error);
      Alert.alert(
        "프로필 수정 실패",
        error?.response?.data?.message || "프로필 수정 중 오류가 발생했습니다."
      );
    }
  };

  const AgeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        setAgeGroup(item as any);
        closeAgeSheet();
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

  const JobItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        setJobTitle(item);
        closeJobSheet();
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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
        <Text>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
        onSubmit={handleSubmit}
        rightLabel="만원"
        headerImageSource={require("@/assets/images/character/big-character-03.png")}
        isSubmitting={updateProfileMutation.isPending}
      />
      {/* 연령대 시트 */}
      <AppBottomSheet ref={ageSheetRef} snapPoints={["65%"]} initialIndex={-1}>
        <SafeAreaViewContext style={{ flex: 1 }} edges={['bottom']}>
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 50, flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {AGE_GROUP_OPTIONS.map((item) => (
              <AgeItem key={item} item={item} />
            ))}
          </ScrollView>
        </SafeAreaViewContext>
      </AppBottomSheet>
      {/* 직업 시트 */}
      <AppBottomSheet ref={jobSheetRef} snapPoints={["90%"]} initialIndex={-1}>
        <SafeAreaViewContext style={{ flex: 1 }} edges={['bottom']}>
          <View style={{ flex: 1, paddingVertical: 8, paddingBottom: 100 }}>
            {JOB_TITLE_OPTIONS.map((item) => (
              <JobItem key={item} item={item} />
            ))}
          </View>
        </SafeAreaViewContext>
      </AppBottomSheet>
    </View>
  );
}
