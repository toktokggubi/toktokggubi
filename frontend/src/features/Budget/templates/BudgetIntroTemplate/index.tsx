import React from "react";
import { View, Text, Image, ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetIntroTemplateProps } from "./types";
import { introTemplateStyles as s } from "./variants";
import NextButton from "@/features/Budget/ui/atoms/NextButton";

export default function BudgetIntroTemplate({
  onNext,
  nextDisabled,
  mascotSource,
}: BudgetIntroTemplateProps) {
  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      {/* 메인 콘텐츠 */}
      <View style={s.content}>
        <View style={s.titleWrap}>
          <Text style={s.line}>
            <Text style={s.hl}>이번 달 예산</Text>을 세워
          </Text>
          <Text style={s.line}>똑똑꺼비와 함께</Text>
          <Text style={s.line}>
            <Text style={s.hl}>소비 관리</Text>를 시작해 보세요.
          </Text>
        </View>

        {mascotSource && (
          <Image
            source={mascotSource as ImageSourcePropType}
            style={s.mascot}
          />
        )}
      </View>

      {/* 하단 버튼 - TotalBudgetTemplate과 동일한 구조 */}
      <View style={s.footer}>
        <NextButton onPress={onNext} disabled={nextDisabled} tone="link" />
      </View>
    </SafeAreaView>
  );
}
