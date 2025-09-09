export interface LoginTemplateProps {
  id: string;
  password: string;
  onChangeId: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
  errorMessage?: string;
}
