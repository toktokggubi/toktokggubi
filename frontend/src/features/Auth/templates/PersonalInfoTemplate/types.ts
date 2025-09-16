import type { ImageSourcePropType } from "react-native";

export interface PersonalInfoData {
  nickname: string;
  gender: "M" | "F";
  ageGroup: "10s" | "20s" | "30s" | "40s" | "50s" | "60s+";
  jobTitle: string; // 자유입력 대신 BottomSheet 선택
  monthlyIncome: number; // 숫자
}

export interface PersonalInfoTemplateProps {
  // values
  nickname: string;
  gender: "M" | "F";
  ageGroup: string; // 텍스트로 보여줌
  jobTitle: string; // 텍스트로 보여줌
  monthlyIncome: string; // 입력 중에는 string

  // handlers
  onChangeNickname: (v: string) => void;
  onChangeGender: (v: "M" | "F") => void;
  onPressAgeGroup: () => void; // BottomSheet 열기
  onPressJobTitle: () => void; // BottomSheet 열기
  onChangeMonthlyIncome: (v: string) => void;

  onSubmit: () => void;

  // helper labels (선택)
  nicknameHelperText?: string;
  incomeHelperText?: string;
  rightLabel?: string; // 우측 라벨 (단위 등)

  // 헤더 이미지
  headerImageSource?: ImageSourcePropType;
}
