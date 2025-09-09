import React from "react";
import { View, Text, Image } from "react-native";
import { BudgetIntroTemplateProps } from "./types";
import { introTemplateStyles as s } from "./variants";
import NextButton from "~features/Budget/ui/NextButton";
import mascot from "@/assets/images/character/character-01.png";

export default function BudgetIntroTemplate({
  onNext,
  nextDisabled,
}: BudgetIntroTemplateProps) {
  return (
    <View style={s.container}>
      <View style={s.body}>
        <View style={s.titleWrap}>
          <Text style={s.line}>
            <Text style={s.hl}>이번 달 예산</Text>을 세워
          </Text>
          <Text style={s.line}>똑똑꺼비와 함께</Text>
          <Text style={s.line}>
            <Text style={s.hl}>소비 관리</Text>를 시작해 보세요.
          </Text>
        </View>

        <Image source={mascot} style={s.mascot} />
      </View>

      <View style={s.footer}>
        <NextButton onPress={onNext} disabled={nextDisabled} tone="link" />
      </View>
    </View>
  );
}
