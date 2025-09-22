import { useMemo } from "react";
import type { ShareItem, UseNbbangCalcParams } from "./types";

export function useNbbangCalc({
  total,
  roundUnit,
  participants,
}: UseNbbangCalcParams): ShareItem[] {
  return useMemo(() => {
    const valid = participants.filter((p) => p.weight > 0);
    const weightSum = valid.reduce((a, b) => a + b.weight, 0);
    if (total <= 0 || !valid.length || weightSum === 0) return [];

    const raw = valid.map((p) => ({
      id: p.id,
      name: p.name,
      amount: total * (p.weight / weightSum),
    }));

    const rounded = raw.map((r) => ({
      ...r,
      amount: Math.round(r.amount / roundUnit) * roundUnit,
    }));

    const diff = total - rounded.reduce((a, b) => a + b.amount, 0);
    if (rounded.length > 0 && diff !== 0) {
      rounded[rounded.length - 1].amount += diff;
    }
    return rounded;
  }, [total, roundUnit, participants]);
}
