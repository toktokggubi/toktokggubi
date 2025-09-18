// src/features/Lucky/templates/Molbbang/JoinRoomTemplate/index.tsx
import React from "react";
import { AppHeader } from "@/shared/ui/AppHeader";
import { SectionTitle } from "@/features/Lucky/ui/SectionTitle";
import { FormPage } from "@/features/Lucky/ui/FormPage";
import { AppInput } from "@/features/Lucky/ui/AppInput";
import { PrimaryButton } from "@/features/Lucky/ui/PrimaryButton";
import type { JoinRoomTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import characterParticle from "@/assets/images/character/character-paticle.png";

export default function JoinRoomTemplate({
  nickname,
  code,
  onChangeNickname,
  onChangeCode,
  onSubmit,
}: JoinRoomTemplateProps) {
  return (
    <>
      <AppHeader title="몰빵" />
      <FormPage>
        <SectionTitle text="코드로 참가" iconSource={characterParticle} />
        <AppInput
          value={nickname}
          onChangeText={onChangeNickname}
          placeholder="닉네임"
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          accessibilityLabel="닉네임 입력"
        />
        <AppInput
          value={code}
          onChangeText={onChangeCode}
          autoCapitalize="characters"
          placeholder="초대 코드(대문자)"
          placeholderTextColor={colors.BLUE_LIGHT_ACTIVE}
          accessibilityLabel="초대 코드 입력"
        />
        <PrimaryButton
          text="입장"
          onPress={onSubmit}
          accessibilityLabel="방 입장"
        />
      </FormPage>
    </>
  );
}
