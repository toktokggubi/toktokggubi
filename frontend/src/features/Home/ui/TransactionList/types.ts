import { Category } from "@/shared/constants/categories";

export interface Transaction {
  id: string;
  merchantName: string;
  category: Category;
  paymentMethod: string;
  amount: number;
  date?: string;
}

export interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
  emptyMessage?: string;
}
