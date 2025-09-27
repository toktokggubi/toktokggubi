import { useState, useEffect } from "react";
import { router } from "expo-router";
import TotalBudgetTemplate from "~features/Budget/templates/TotalBudgetTemplate";
import { useBudgetDraft } from "~features/Budget/context/BudgetDraftContext";
import { fetchAITotalRecommendation } from "~features/Budget/api/ai-fetchers";

export default function TotalBudgetInputScreen() {
  const [totalAmount, setTotalAmount] = useState(500_000); // 기본값을 500,000으로 설정
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRecommendationSuccess, setAiRecommendationSuccess] = useState(false);
  const { 
    saveTotal, 
    isSavingTotal, 
    totalError, 
    totalAmount: contextTotalAmount, 
    version, 
    draftId,
    loadDraftData 
  } = useBudgetDraft();

  // AI 추천값 가져오기
  const loadAIRecommendation = async () => {
    try {
      setLoadingAI(true);
      setAiError(null);
      setAiRecommendationSuccess(false);
      
      const aiRecommendation = await fetchAITotalRecommendation();
      if (aiRecommendation && aiRecommendation.totalAmount > 0) {
        setTotalAmount(aiRecommendation.totalAmount);
        setAiRecommendationSuccess(true);
      }
    } catch (error) {
      console.log('AI 추천값 로딩 실패:', error);
      setAiError('AI 추천값을 불러오는데 실패했습니다. 기본값을 사용합니다.');
      setAiRecommendationSuccess(false);
      // AI 실패해도 기본값 그대로 사용
    } finally {
      setLoadingAI(false);
    }
  };

  // 이전에 저장된 총예산 데이터가 있으면 불러오기, 없으면 AI 추천값 로딩
  useEffect(() => {
    loadDraftData();
    if (contextTotalAmount) {
      setTotalAmount(contextTotalAmount);
    } else {
      // 이전 데이터가 없으면 AI 추천값 로딩
      loadAIRecommendation();
    }
  }, [contextTotalAmount, loadDraftData]);

  const goPrev = () => router.push("/(tabs)/home");
  
  const goNext = async () => {
    try {
      await saveTotal(totalAmount);
      router.push("/budget/fixed-expense");
    } catch (error) {
      // 에러 처리 (토스트 메시지 등)
    }
  };

  return (
    <TotalBudgetTemplate
      amount={totalAmount}
      onChangeAmount={setTotalAmount}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={totalAmount <= 0 || isSavingTotal}
      loadingAI={loadingAI}
      aiError={aiError}
      onRetryAI={loadAIRecommendation}
      aiRecommendationSuccess={aiRecommendationSuccess}
    />
  );
}
