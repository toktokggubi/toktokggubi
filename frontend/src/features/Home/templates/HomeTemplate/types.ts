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

export interface HomeTemplateProps {
  // 전체 예산
  totalBudget: {
    currentAmount: number;
    totalAmount: number;
  };
  
  // 사용가능금액
  availableAmount: number;
  
  // 캐릭터 메시지
  characterMessage?: string;
  
  // 카테고리별 예산
  categoryBudgets: CategoryBudget[];
  
  // 카테고리별 거래 내역
  transactions?: Partial<Record<Category, Transaction[]>>;
  
  // 이벤트 핸들러
  onTotalBudgetPress?: () => void;
  onCategoryPress?: (category: Category) => void;
}
