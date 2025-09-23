export interface AIRecommendationData {
  totalBudget: number;
  categoryBudgets: Array<{ 
    name: string; 
    amount: number; 
    reason?: string; // 추천 이유 (선택사항)
  }>;
  fixedExpenses?: Array<{ 
    name: string; 
    amount: number; 
    includeInBudget: boolean;
    billingDay?: number;
  }>;
  // AI 추천 이유 정보
  recommendationReason: {
    totalBudgetReason: string;           // 총 예산 설정 이유
    categoryReasons: Array<{             // 카테고리별 상세 이유
      categoryName: string;
      reason: string;
      analysis?: string;                // 분석 근거 (선택사항)
    }>;
    fixedExpenseReasons?: Array<{        // 고정지출 이유 (선택사항)
      expenseName: string;
      reason: string;
    }>;
    overallInsights: string[];           // 전체적인 인사이트
  };
}

export interface AIRecommendationResponse {
  success: boolean;
  data: AIRecommendationData;
  message?: string;
}
