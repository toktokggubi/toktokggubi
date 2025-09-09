import React, { memo } from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  length: number;
  activeIndex: number;
}

function PagerDotsImpl({ length, activeIndex }: Props) {
  return (
    <View style={s.row}>
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
    marginTop: 10,
    justifyContent: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#d1d5db" },
  active: { backgroundColor: "#2563eb", width: 16, borderRadius: 3 },
});

export default memo(PagerDotsImpl);
