import { http } from "@/shared/api/http";

// ─────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────

export interface AiReportInformationRequest {
  userId: number;
  username: string;
  year: string;
  month: string;
}

export interface AiReportInformationResponse {
  budget_set: Record<string, number>;
  actual: Record<string, number>;
}

export interface AiUserReportGetRequest {
  year: number;
  month: number;
}

export interface UserInfo {
  userId: number;
  username: string;
  year: number;
  month: number;
}

export interface SpendingByCategory {
  category: string;
  percentage: number;
  amount: number;
  budget: number;
}

export interface MonthlySpendingSummary {
  month: string;
  totalSpending: number;
  budgetUsagePercentage: number;
  incomeUsagePercentage: number;
}

export interface TransactionDetail {
  amount: number;
  location: string;
  date: string;
}

export interface AbnormalSpending {
  totalAbnormalSpending: number;
  transactions: TransactionDetail[];
}

export interface BudgetAdjustment {
  category: string;
  currentSpending: number;
  budget: number;
  recommendation: string;
}

export interface SummaryReport {
  overallSummary: string;
  monthlySpendingSummary: MonthlySpendingSummary;
  spendingByCategory: SpendingByCategory[];
  abnormalSpending: AbnormalSpending;
  budgetAdjustment: BudgetAdjustment;
}

export interface SpendingTransaction {
  merchant: string;
  category: string;
  paymentMethod: string;
  amount: number;
}

export interface SpendingPerDay {
  date: string;
  transactions: SpendingTransaction[];
}

export interface TopSpendingMerchant {
  rank: number;
  merchant: string;
  transactionsCount: number;
}

export interface SpendingDetails {
  totalTransactions: number;
  maxDailyTransactions: number;
  dailyTransactionCounts: Record<string, number>;
  spendingPerDay: SpendingPerDay[];
  topSpendingMerchants: TopSpendingMerchant[];
}

export interface UserReportResponse {
  userInfo: UserInfo;
  summaryReport: SummaryReport;
  spendingDetails: SpendingDetails;
}

// ─────────────────────────────────────────────────────────────
// API 함수들
// ─────────────────────────────────────────────────────────────

/**
 * AI 월간 리포트 정보를 조회합니다.
 * 예산 설정 및 실제 지출 내역을 포함한 월간 리포트 데이터를 반환합니다.
 */
export const fetchAiReportInformation = async (
  request: AiReportInformationRequest
): Promise<AiReportInformationResponse> => {
  const response = await http.post<AiReportInformationResponse>(
    "/ai/report/information",
    request
  );
  return response.data;
};

/**
 * AI 사용자 리포트를 조회합니다.
 * 사용자 ID, 닉네임, 조회할 년도 및 월을 기반으로 AI 월간 리포트 데이터를 반환합니다.
 */
export const fetchAiUserReport = async (
  request: AiUserReportGetRequest
): Promise<UserReportResponse> => {
  console.log("fetchAiUserReport 호출:", request);
  
  try {
    const response = await http.post<UserReportResponse>(
      "/ai/report/get",
      request
    );
    console.log("fetchAiUserReport 성공:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("fetchAiUserReport 실패:", error);
    console.error("에러 상태:", error.response?.status);
    console.error("에러 데이터:", error.response?.data);
    console.error("에러 헤더:", error.response?.headers);
    throw error;
  }
};

/**
 * 현재 사용자의 AI 리포트 정보를 조회합니다.
 * 인증된 사용자의 정보를 자동으로 포함합니다.
 */
export const fetchCurrentUserReport = async (
  year: number,
  month: number
): Promise<UserReportResponse> => {
  return fetchAiUserReport({ year, month });
};

/**
 * 현재 사용자의 AI 리포트 정보(예산/실제 지출)를 조회합니다.
 * 실제 사용자 ID와 닉네임을 전달해야 합니다.
 */
export const fetchCurrentUserReportInformation = async (
  year: number,
  month: number,
  userId: number,
  username: string
): Promise<AiReportInformationResponse> => {
  return fetchAiReportInformation({
    userId: userId, // 실제 사용자 ID
    username,
    year: year.toString(),
    month: month.toString().padStart(2, '0')
  });
};
