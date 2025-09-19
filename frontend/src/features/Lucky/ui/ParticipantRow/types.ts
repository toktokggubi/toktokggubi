export interface ParticipantRowProps {
  id: string;
  name: string;
  weight: number;
  onChangeName: (id: string, name: string) => void;
  onChangeWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
}
