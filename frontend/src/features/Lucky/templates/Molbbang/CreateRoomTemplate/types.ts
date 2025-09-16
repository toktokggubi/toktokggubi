export interface CreateRoomTemplateProps {
  nickname: string;
  amount: string;
  onChangeNickname: (v: string) => void;
  onChangeAmount: (v: string) => void;
  onSubmit: () => void;
}
