import { Category } from "@/shared/constants/categories";

export interface TransactionRowProps {
  merchantName: string;
  category: Category;
  paymentMethod: string;
  amount: number;
  date?: string;
  onPress?: () => void;
}
