import React from "react";
import { View, StyleSheet, Button } from "react-native";
import type { MyPageTemplateProps } from "./types";
import MenuTile from "@/features/User/ui/MenuTile";
import { colors } from "@/shared/constants/colors";

export default function MyPageTemplate({
  onPressCard,
  onPressGifticon,
  onPressLogout,
  cardImage,
  gifticonImage,
  isLoggingOut = false,
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
            title="🚪 로그아웃"
            onPress={onPressLogout}
            disabled={isLoggingOut}
            color="#FF4444"
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, padding: 16 },
  grid: { flexDirection: "row", gap: 16 },
  logoutContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
});
