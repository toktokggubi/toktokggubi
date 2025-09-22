import { Category } from "@/shared/constants/categories";

export interface CategoryBudget {
  category: Category;
  currentAmount: number;
  totalAmount: number;
}

export interface Transaction {
  id: string;
  merchantName: string;
  category: Category;
  paymentMethod: string;
  amount: number;
  date?: string;
}

export interface ProgressListProps {
  categoryBudgets: CategoryBudget[];
  onCategoryPress?: (category: Category) => void;
  title?: string;
  transactions?: Partial<Record<Category, Transaction[]>>;
  onEditPress?: () => void;
}
