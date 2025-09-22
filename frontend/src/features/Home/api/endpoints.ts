export const HOME_ENDPOINTS = {
  // TX-1 이번 달 소비 금액 조회 (전체)
  monthlySummary: "/transaction/summary",
  // TX-1 이번 달 소비 금액 조회 (카테고리별)
  monthlySummaryByCategory: "/transaction/summary/category",
  // TX-1 이번달 카테고리별 소비 목록 조회
  monthlyCategoryList: "/transaction/category",
  // 예산관리 - 총예산 조회
  budgetTotal: "/budget/total",
  // 예산관리 - 카테고리별 예산 조회
  budgetCategory: "/budget/category",
} as const;
