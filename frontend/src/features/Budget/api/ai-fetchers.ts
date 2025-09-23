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
  const { data } = await http.get("/budget/previous");
  return data;
}
