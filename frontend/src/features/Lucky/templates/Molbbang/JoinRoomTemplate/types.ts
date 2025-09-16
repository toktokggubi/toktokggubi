export interface JoinRoomTemplateProps {
  nickname: string;
  code: string;
  onChangeNickname: (v: string) => void;
  onChangeCode: (v: string) => void;
  onSubmit: () => void;
}
