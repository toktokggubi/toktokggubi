import { http } from "@/shared/api/http";
import { HOME_ENDPOINTS } from "./endpoints";

// TX-1 이번 달 소비 금액 조회 (전체)
export async function fetchMonthlySummary(params?: {
  from?: string; // yyyyMMdd or yyyy-MM-dd
  to?: string;   // yyyyMMdd or yyyy-MM-dd
}) {
  const { data } = await http.get(HOME_ENDPOINTS.monthlySummary, {
    params,
  });
  return data as {
    month: string;
    totalAmount: number;
    totalCount: number;
  };
}

// TX-1 이번 달 소비 금액 조회 (카테고리별)
export async function fetchMonthlySummaryByCategory() {
  // 테스트를 위해 2025년 9월 데이터 조회
  const { data } = await http.get(HOME_ENDPOINTS.monthlySummaryByCategory, {
    params: { ym: '202509' }
  });
  return data as {
    categories: Array<{
      categoryId: number;
      categoryName: string;
      amount: number;
      count: number;
    }>;
  };
}

// TX-1 이번달 카테고리별 소비 목록 조회
export async function fetchMonthlyCategoryList() {
  // 테스트를 위해 2025년 9월 데이터 조회
  const { data } = await http.get(HOME_ENDPOINTS.monthlyCategoryList, {
    params: { ym: '202509' }
  });
  return data as {
    userId: number;
    period: string;
    range: {
      startDate: string;
      endDate: string;
    };
    categories: Array<{
      categoryId: number;
      categoryName: string;
      totalAmount: number;
      count: number;
      transactions: Array<{
        transactionUniqueNo: string;
        dateTime: string;
        amount: number;
        cardStatus: string;
        merchantId: number;
        merchantName: string;
        userCardId: number;
        cardName: string;
      }>;
    }>;
  };
}

// 예산관리 - 총예산 조회
export async function fetchBudgetTotal() {
  const { data } = await http.get(HOME_ENDPOINTS.budgetTotal);
  return data as {
    totalAmount: number;
  };
}

// 예산관리 - 카테고리별 예산 조회
export async function fetchBudgetCategory() {
  const { data } = await http.get(HOME_ENDPOINTS.budgetCategory);
  return data as Array<{
    categoryId: number;
    finalAmount: number;
  }>;
}