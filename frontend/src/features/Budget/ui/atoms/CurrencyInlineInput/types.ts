export interface CurrencyInlineInputProps {
  value: number | string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  placeholder?: string;
}
