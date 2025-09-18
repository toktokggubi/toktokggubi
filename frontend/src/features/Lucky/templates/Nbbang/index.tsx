import { AppInput } from "@/features/Lucky/ui/AppInput";
import { NbbangActionButton } from "@/features/Lucky/ui/NbbangActionButton";
import { NbbangParticipantRow } from "@/features/Lucky/ui/ParticipantRow";
import { NbbangRoundUnitChips } from "@/features/Lucky/ui/RoundUnitChips";
import { NbbangShareList } from "@/features/Lucky/ui/ShareList";
import { AppHeader } from "@/shared/ui/AppHeader";
import React from "react";
import { ScrollView, View } from "react-native";
import type { NbbangTemplateProps } from "./types";
import { s } from "./variants";

export default function NbbangTemplate(props: NbbangTemplateProps) {
  const {
    total,
    onChangeTotal,
    roundUnit,
    onChangeRoundUnit,
    roundUnitOptions,
    participants,
    onAdd,
    onRemove,
    onChangeName,
    onChangeWeight,
    shares,
    onReset,
  } = props;

  return (
    <View style={s.root}>
      <AppHeader title="N빵 계산기" />
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppInput
          label="총액"
          keyboardType="number-pad"
          value={total ? String(total) : ""}
          onChangeText={(t) => onChangeTotal(Number(t.replace(/\D/g, "")) || 0)}
          placeholder="예: 45200"
        />

        <NbbangRoundUnitChips
          value={roundUnit}
          options={roundUnitOptions}
          onChange={onChangeRoundUnit}
        />

        {participants.map((p) => (
          <NbbangParticipantRow
            key={p.id}
            id={p.id}
            name={p.name}
            weight={p.weight}
            onChangeName={onChangeName}
            onChangeWeight={onChangeWeight}
            onRemove={onRemove}
          />
        ))}

        <View style={s.row}>
          <NbbangActionButton text="인원 추가" onPress={onAdd} variant="add" />
          <View style={{ width: 12 }} />
          <NbbangActionButton text="초기화" onPress={onReset} variant="reset" />
        </View>

        <NbbangShareList items={shares} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}
