// Budget API 관련 타입 정의

export interface FixedExpense {
  title: string;
  amount: number;
  payDay: number;
  includeInBudget: boolean;
}

export interface CategoryAllocation {
  categoryId: number;
  finalAmount: number;
}

export interface DraftSaveResponse {
  draftId: string;
  version: number;
  snapshot: any; // DraftSnapshotDto - 나중에 상세 타입 정의
  ttlSeconds: number;
}

export interface BudgetCategory {
  categoryId: number;
  categoryName: string;
  finalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usageRate: number;
}

export interface BudgetCommitResponse {
  userId: number;
  budgetYm: string;
  totalAmount: number;
  isFinalized: boolean;
  categories: BudgetCategory[];
}

// Request DTOs
export interface DraftTotalRequest {
  totalAmount: number;
}

export interface DraftFixedRequest {
  expectedVersion: number;
  fixedExpenses: FixedExpense[];
}

export interface DraftCategoriesRequest {
  expectedVersion: number;
  selectedCategories: number[];
  categoryAllocations: CategoryAllocation[];
}
