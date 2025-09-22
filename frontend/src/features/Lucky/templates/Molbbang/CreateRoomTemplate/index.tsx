// src/features/Lucky/templates/Molbbang/CreateRoomTemplate/index.tsx
import React from "react";
import { AppHeader } from "@/shared/ui/AppHeader";
import { SectionTitle } from "@/features/Lucky/ui/SectionTitle";
import { FormPage } from "@/features/Lucky/ui/FormPage";
import { AppInput } from "@/features/Lucky/ui/AppInput";
import { PrimaryButton } from "@/features/Lucky/ui/PrimaryButton";
import type { CreateRoomTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import characterParticle from "@/assets/images/character/character-paticle.png";
export default function CreateRoomTemplate({
  nickname,
  amount,
  onChangeNickname,
  onChangeAmount,
  onSubmit,
}: CreateRoomTemplateProps) {
  return (
    <>
      <AppHeader title="몰빵" />
      <FormPage>
        <SectionTitle text="방 만들기" iconSource={characterParticle} />
        <AppInput
          value={nickname}
          onChangeText={onChangeNickname}
          placeholder="닉네임"
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          accessibilityLabel="닉네임 입력"
        />
        <AppInput
          value={amount}
          onChangeText={onChangeAmount}
          keyboardType="number-pad"
          placeholder="몰빵 금액(원)"
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          accessibilityLabel="몰빵 금액 입력"
        />
        <PrimaryButton
          text="생성하기"
          onPress={onSubmit}
          accessibilityLabel="방 생성"
        />
      </FormPage>
    </>
  );
}
