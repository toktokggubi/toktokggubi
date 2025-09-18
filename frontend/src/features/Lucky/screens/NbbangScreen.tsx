import React, { useCallback, useMemo, useState } from "react";
import NbbangTemplate from "@/features/Lucky/templates/Nbbang";
import { useNbbangCalc } from "@/features/Lucky/model/nbbang/useNbbangCalc";
import type { Participant } from "@/features/Lucky/model/nbbang/types";

const ROUND_UNITS = [1, 10, 100] as const;

export default function NbbangScreen() {
  const [total, setTotal] = useState<number>(0);
  const [roundUnit, setRoundUnit] = useState<number>(10);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "p1", name: "나", weight: 1 },
    { id: "p2", name: "친구1", weight: 1 },
  ]);

  const shares = useNbbangCalc({ total, roundUnit, participants });

  const addPerson = useCallback(() => {
    setParticipants((prev) => {
      const idx = prev.length + 1;
      return [...prev, { id: `p${idx}`, name: `친구${idx - 1}`, weight: 1 }];
    });
  }, []);

  const removePerson = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const changeName = useCallback((id: string, name: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }, []);

  const changeWeight = useCallback((id: string, weight: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, weight } : p))
    );
  }, []);

  const resetAll = useCallback(() => {
    setTotal(0);
    setRoundUnit(10);
    setParticipants([
      { id: "p1", name: "나", weight: 1 },
      { id: "p2", name: "친구1", weight: 1 },
    ]);
  }, []);

  const roundUnitOptions = useMemo(() => Array.from(ROUND_UNITS), []);

  return (
    <NbbangTemplate
      total={total}
      onChangeTotal={setTotal}
      roundUnit={roundUnit}
      onChangeRoundUnit={setRoundUnit}
      roundUnitOptions={roundUnitOptions}
      participants={participants}
      onAdd={addPerson}
      onRemove={removePerson}
      onChangeName={changeName}
      onChangeWeight={changeWeight}
      shares={shares}
      onReset={resetAll}
    />
  );
}
