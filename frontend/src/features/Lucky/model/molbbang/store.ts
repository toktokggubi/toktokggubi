import { create } from "zustand";
import type { MolbbangRoom } from "./types";

interface MolbbangState {
  me: { userId: string; nickname: string } | null;
  room: MolbbangRoom | null;
  setMe: (n: { userId: string; nickname: string }) => void;
  setRoom: (r: MolbbangRoom | null) => void;
}

export const useMolbbangStore = create<MolbbangState>((set) => ({
  me: null,
  room: null,
  setMe: (me) => set({ me }),
  setRoom: (room) => set({ room }),
}));
