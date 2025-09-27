import { http } from "@/shared/api/http";
import type { AIRecommendationData } from "../types/ai-recommendations.types";

// AI 예산 추천 API fetcher
export async function fetchAIRecommendations(): Promise<AIRecommendationData> {
  const { data } = await http.post("/ai/budget/recommend");
  return data;
}

// 이전 달 예산 조회 API fetcher
export async function fetchPreviousBudget(): Promise<{
  totalAmount: number;
  categoryBudgets: Array<{ name: string; amount: number }>;
  fixedExpenses: Array<{ name: string; amount: number; includeInBudget: boolean; billingDay?: number }>;
}> {
  try {
    // 이전 달 총 예산 조회
    const { data: totalData } = await http.get("/budget/previous/total");
    
    // 이전 달 고정 지출 목록 조회
    const { data: fixedData } = await http.get("/budget/previous/fixed/list");
    
    // 카테고리별 예산은 현재는 빈 배열로 설정 (백엔드에 해당 API가 없음)
    const categoryBudgets: Array<{ name: string; amount: number }> = [];
    
    // 고정 지출 데이터 변환
    const fixedExpenses = (fixedData || []).map((item: any) => ({
      name: item.title,
      amount: item.amount,
      includeInBudget: item.includeInBudget,
      billingDay: item.payDay
    }));

    return {
      totalAmount: totalData.totalAmount || 0,
      categoryBudgets,
      fixedExpenses
    };
  } catch (error) {
    // 이전 달 예산이 없으면 에러를 던져서 catch 블록에서 처리
    throw error;
  }
}
