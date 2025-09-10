import React from "react";
import { View, StyleSheet } from "react-native";
import type { MyPageTemplateProps } from "./types";
import MenuTile from "@/features/User/ui/MenuTile";

export default function MyPageTemplate({
  onPressCard,
  onPressGifticon,
  cardImage,
  gifticonImage,
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
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8FBFF", padding: 16 },
  grid: { flexDirection: "row", gap: 16 },
});
