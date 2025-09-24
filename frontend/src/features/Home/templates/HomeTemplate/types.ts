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

// API 응답 타입 정의
export interface HomeData {
  totalBudget: {
    currentAmount: number;
    totalAmount: number;
  };
  availableAmount: number;
  characterMessage: string;
  month: string;
  listTitle: string;
  categoryBudgets: CategoryBudget[];
  transactions: Partial<Record<Category, Transaction[]>>;
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
  onBudgetSetup?: () => void;
  onBudgetEditPress?: () => void;
  onNotificationPress?: () => void;
  unreadNotificationCount?: number;

  // UI 설정
  month?: string;
  listTitle?: string;

  // 예산 설정 여부
  hasBudget?: boolean;

  // 로딩 및 에러 상태
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  // 새로고침 관련
  onRefresh?: () => void;
  refreshing?: boolean;
}
