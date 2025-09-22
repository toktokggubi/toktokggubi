import { useQuery } from "@tanstack/react-query";
import { checkBudgetStatus } from "../api/fetchers";

export const budgetKeys = {
  all: ["budget"] as const,
  status: () => [...budgetKeys.all, "status"] as const,
};

// 예산 설정 여부 확인
export const useBudgetStatusQuery = () => {
  return useQuery({
    queryKey: budgetKeys.status(),
    queryFn: checkBudgetStatus,
    retry: (failureCount, error: any) => {
      // BUDGET_NOT_SET, BUDGET_NOT_FOUND 에러는 재시도하지 않음
      if (error?.message === 'BUDGET_NOT_SET' || error?.message === 'BUDGET_NOT_FOUND') {
        return false;
      }
      // 다른 에러는 최대 2번 재시도
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};
