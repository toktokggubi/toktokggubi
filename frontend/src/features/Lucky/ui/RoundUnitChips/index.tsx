import React, { memo } from "react";
import { View, Pressable, Text } from "react-native";
import type { RoundUnitChipsProps } from "./types";
import { s } from "./variants";

export const NbbangRoundUnitChips = memo(function NbbangRoundUnitChips({
  value,
  options,
  onChange,
}: RoundUnitChipsProps) {
  return (
    <View style={s.row}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[s.chip, active && s.active]}
          >
            <Text style={[s.chipTxt, active && s.activeTxt]}>
              {opt >= 1000 ? `${opt}원` : `${opt}원 단위`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
