import React from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface RoomQrSheetProps {
  value: string; // 방 링크/코드
}

export default function RoomQrSheet({ value }: RoomQrSheetProps) {
  return (
    <View style={s.wrap}>
      <QRCode value={value} size={220} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { padding: 20, alignItems: "center", justifyContent: "center" },
});
