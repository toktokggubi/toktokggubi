export interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onSubmit?: (text: string) => void;
}
