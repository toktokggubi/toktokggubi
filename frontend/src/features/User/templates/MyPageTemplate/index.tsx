import React from "react";
import { View, StyleSheet } from "react-native";
import type { MyPageTemplateProps } from "./types";
import MenuTile from "@/features/User/ui/MenuTile";
import Button from "@/features/Auth/ui/Button";
import { colors } from "@/shared/constants/colors";

export default function MyPageTemplate({
  onPressCard,
  onPressGifticon,
  onPressLogout,
  cardImage,
  gifticonImage,
  isLoggingOut = false,
  onPressLogin,
  onPressBudget,
}: MyPageTemplateProps) {
  return (
    <View style={s.page}>
      <View style={s.grid}>
        <MenuTile label="내 카드" image={cardImage} onPress={onPressCard} />
        <MenuTile
          label="내 기프티콘"
          image={gifticonImage}
          onPress={onPressGifticon}
        />
      </View>
      {/* 로그아웃 버튼 */}
      {onPressLogout && (
        <View style={s.logoutContainer}>
          <Button
            value="🚪 로그아웃"
            onPress={onPressLogout}
            disabled={isLoggingOut}
          />
        </View>
      )}
      {/* 임시 버튼들 - 나중에 제거 예정 */}
      <View style={s.buttonContainer}>
        <Button value="로그인 화면으로!!" onPress={onPressLogin} />
        <Button value="예산 설정 시작" onPress={onPressBudget} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, padding: 16 },
  grid: { flexDirection: "row", gap: 16 },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  logoutContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
});
