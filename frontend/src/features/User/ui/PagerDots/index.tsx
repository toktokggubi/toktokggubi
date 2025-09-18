import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";

interface Props {
  length: number;
  activeIndex: number;
  top?: number;
}

function PagerDotsImpl({ length, activeIndex, top = 10 }: Props) {
  return (
    <View style={[s.row, { marginTop: top }]}>
      {Array.from({ length }).map((_, i) => (
        <View key={i} style={[s.dot, i === activeIndex && s.active]} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#d1d5db" },
  active: { backgroundColor: colors.BLUE_NORMAL, width: 16, borderRadius: 3 },
});

export default memo(PagerDotsImpl);
