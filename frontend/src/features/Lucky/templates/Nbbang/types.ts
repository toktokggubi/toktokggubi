import type {
  Participant,
  ShareItem,
} from "@/features/Lucky/model/nbbang/types";

export interface NbbangTemplateProps {
  total: number;
  onChangeTotal: (n: number) => void;
  roundUnit: number;
  onChangeRoundUnit: (n: number) => void;
  roundUnitOptions: number[];
  participants: Participant[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChangeName: (id: string, name: string) => void;
  onChangeWeight: (id: string, weight: number) => void;
  shares: ShareItem[];
  onReset: () => void;
}
