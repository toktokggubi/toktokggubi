import React, { memo } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import type { ParticipantRowProps } from "./types";
import { s } from "./variants";

export const NbbangParticipantRow = memo(function NbbangParticipantRow({
  id,
  name,
  weight,
  onChangeName,
  onChangeWeight,
  onRemove,
}: ParticipantRowProps) {
  return (
    <View style={s.wrap}>
      <TextInput
        style={s.name}
        value={name}
        onChangeText={(t) => onChangeName(id, t)}
        placeholder="이름"
      />
      <View style={s.weightBox}>
        <Text style={s.weightLabel}>가중치</Text>
        <TextInput
          style={s.weightInput}
          keyboardType="number-pad"
          value={String(weight)}
          onChangeText={(t) =>
            onChangeWeight(id, Number(t.replace(/\D/g, "")) || 0)
          }
        />
      </View>
      <Pressable
        onPress={() => onRemove(id)}
        style={s.removeBtn}
        accessibilityRole="button"
      >
        <Text style={s.removeTxt}>삭제</Text>
      </Pressable>
    </View>
  );
});
