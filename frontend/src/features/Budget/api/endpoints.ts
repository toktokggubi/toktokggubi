export const BUDGET_ENDPOINTS = {
  // BD-1 총예산 입력(redis)
  saveDraftTotal: "/budget/draft/save/total",
  // BD-3 고정지출 입력(redis)
  saveDraftFixed: "/budget/draft/save/fixed",
  // BD-6 카테고리 선택/금액 수정(redis)
  saveDraftCategories: "/budget/draft/save/categories",
  // BD-6 마지막 버튼 (commit)
  commit: "/budget/commit",
  // 예산 설정 여부 확인
  getTotalAmount: "/budget/total",
  // 예산 전체 저장/수정 (Redis 없이 한번에)
  saveAllBudget: "/budget/all/recommend",
} as const;
