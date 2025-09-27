import { http } from "@/shared/api/http";

// AI 총 예산 추천 API fetcher (간단한 버전)
export async function fetchAITotalRecommendation(): Promise<{ totalAmount: number }> {
  try {
    const { data } = await http.get("/budget/ai/total/set");
    return {
      totalAmount: data.totalAmount || 800000
    };
  } catch (error) {
    throw error;
  }
}
