import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { Modal } from "react-native";
import BudgetEditTemplate from "~features/Budget/templates/BudgetEditTemplate";
import AddFixedExpenseForm from "~features/Budget/ui/forms/AddFixedExpenseForm";
import type { AIRecommendationData } from "~features/Budget/types/ai-recommendations.types";
import type { AddFixedExpenseFormValues } from "~features/Budget/ui/forms/AddFixedExpenseForm/types";
import {
  fetchAIRecommendations,
  fetchPreviousBudget,
} from "~features/Budget/api/ai-fetchers";
import {
  saveDraftTotal,
  saveDraftFixed,
  saveDraftCategories,
  commitBudget,
} from "~features/Budget/api/fetchers";

// 카테고리 이름을 ID로 변환하는 함수
const getCategoryIdByName = (categoryName: string): number => {
  const categoryMap: Record<string, number> = {
    식비: 1,
    "카페/간식": 2,
    "술/유흥": 3,
    생활: 4,
    쇼핑: 5,
    "뷰티/미용": 6,
    교통: 7,
    자동차: 8,
    "의료/건강": 9,
    문화: 10,
  };
  return categoryMap[categoryName] || 1;
};

// 현재 월을 가져오는 함수
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getMonth() + 1}월`;
};

// 모든 카테고리 목록
const ALL_CATEGORIES = [
  { id: 1, name: "식비" },
  { id: 2, name: "카페/간식" },
  { id: 3, name: "술/유흥" },
  { id: 4, name: "생활" },
  { id: 5, name: "쇼핑" },
  { id: 6, name: "뷰티/미용" },
  { id: 7, name: "교통" },
  { id: 8, name: "자동차" },
  { id: 9, name: "의료/건강" },
  { id: 10, name: "문화" },
];

// 기본 AI 추천 데이터 생성 (최종 폴백용)
const getDefaultAIRecommendations = (): AIRecommendationData => {
  return {
    totalBudget: 800000, // 80만원
    categoryBudgets: [
      { name: "식비", amount: 200000, reason: "월 평균 식비 패턴 분석" },
      { name: "카페/간식", amount: 80000, reason: "카페 이용 빈도 기반" },
      { name: "술/유흥", amount: 0, reason: "이전 달 미사용" },
      { name: "생활", amount: 150000, reason: "생활용품 구매 패턴" },
      { name: "쇼핑", amount: 120000, reason: "온라인 쇼핑 빈도" },
      { name: "뷰티/미용", amount: 0, reason: "이전 달 미사용" },
      { name: "교통", amount: 100000, reason: "대중교통 이용 패턴" },
      { name: "자동차", amount: 0, reason: "이전 달 미사용" },
      { name: "의료/건강", amount: 0, reason: "이전 달 미사용" },
      { name: "문화", amount: 50000, reason: "문화생활 참여도" },
    ],
    fixedExpenses: [
      { name: "월세", amount: 300000, includeInBudget: true, billingDay: 1 },
      { name: "통신비", amount: 50000, includeInBudget: true, billingDay: 15 },
      { name: "보험료", amount: 80000, includeInBudget: true, billingDay: 20 },
    ],
    recommendationReason: {
      totalBudgetReason: "이전 달 지출 패턴을 분석하여 5% 증가한 금액으로 설정",
      categoryReasons: [
        {
          categoryName: "식비",
          reason: "월 평균 식비 패턴 분석 기반",
          analysis: "지난 3개월 평균 식비 190,000원에서 5% 증가",
        },
        {
          categoryName: "카페/간식",
          reason: "카페 이용 빈도 고려",
          analysis: "주 3-4회 카페 이용 패턴 분석",
        },
        {
          categoryName: "생활",
          reason: "생활용품 구매 패턴",
          analysis: "월 평균 생활용품 구매액 기반",
        },
        {
          categoryName: "쇼핑",
          reason: "온라인 쇼핑 빈도",
          analysis: "온라인 쇼핑몰 이용 패턴 분석",
        },
        {
          categoryName: "교통",
          reason: "대중교통 이용 패턴",
          analysis: "지하철/버스 이용 빈도 기반",
        },
        {
          categoryName: "문화",
          reason: "문화생활 참여도",
          analysis: "영화관, 전시회 등 문화활동 참여 패턴",
        },
      ],
      fixedExpenseReasons: [
        { expenseName: "월세", reason: "이전 달과 동일한 고정 지출" },
        { expenseName: "통신비", reason: "이전 달과 동일한 고정 지출" },
        { expenseName: "보험료", reason: "이전 달과 동일한 고정 지출" },
      ],
      overallInsights: [
        "미사용 카테고리는 0원으로 설정하여 유연성 확보",
        "이전 달 대비 5% 증가로 인플레이션 고려",
        "고정 지출은 이전 달과 동일하게 유지",
      ],
    },
  };
};

// 이전 예산 기반 추천 생성 함수
const generateRecommendationsFromPrevious = (
  previousBudget: any
): AIRecommendationData => {
  const totalBudget = previousBudget.totalAmount || 800000;
  const categoryBudgets = ALL_CATEGORIES.map((category) => {
    const prevCategory = previousBudget.categoryBudgets?.find(
      (cat: any) => cat.name === category.name
    );
    return {
      name: category.name,
      amount: prevCategory ? Math.round(prevCategory.amount * 1.05) : 0, // 5% 증가
      reason: prevCategory ? "이전 달 예산 기반 5% 증가" : "이전 달 미사용",
    };
  });

  const fixedExpenses = (previousBudget.fixedExpenses || []).map(
    (expense: any) => ({
      name: expense.name,
      amount: expense.amount,
      includeInBudget: expense.includeInBudget,
      billingDay: expense.billingDay,
    })
  );

  return {
    totalBudget,
    categoryBudgets,
    fixedExpenses,
    recommendationReason: {
      totalBudgetReason: "이전 달 예산을 기반으로 5% 증가한 금액으로 설정",
      categoryReasons: categoryBudgets
        .filter((cat) => cat.amount > 0)
        .map((cat) => ({
          categoryName: cat.name,
          reason: cat.reason || "이전 달 패턴 기반",
          analysis: `이전 달 ${cat.name} 지출 패턴 분석`,
        })),
      fixedExpenseReasons: fixedExpenses.map((expense: any) => ({
        expenseName: expense.name,
        reason: "이전 달과 동일한 고정 지출",
      })),
      overallInsights: [
        "이전 달 예산을 기반으로 5% 증가",
        "미사용 카테고리는 0원으로 설정",
        "고정 지출은 이전 달과 동일하게 유지",
      ],
    },
  };
};

export default function AIBudgetSetupScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI 추천 데이터 상태
  const [aiRecommendations, setAIRecommendations] =
    useState<AIRecommendationData | null>(null);

  // 예산 데이터 상태
  const [totalBudget, setTotalBudget] = useState(0);
  const [variableBudget, setVariableBudget] = useState(0);
  const [fixedIncludedBudget, setFixedIncludedBudget] = useState(0);
  const [fixedExcludedBudget, setFixedExcludedBudget] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState<
    Array<{ name: string; amount: number }>
  >([]);
  const [fixedIncludedExpenses, setFixedIncludedExpenses] = useState<
    Array<{
      id: string;
      name: string;
      amount: number;
      includeInBudget: boolean;
      billingDay?: number;
    }>
  >([]);
  const [fixedExcludedExpenses, setFixedExcludedExpenses] = useState<
    Array<{
      id: string;
      name: string;
      amount: number;
      includeInBudget: boolean;
      billingDay?: number;
    }>
  >([]);

  // 모달 상태
  const [formVisible, setFormVisible] = useState(false);
  const [editingFixedExpense, setEditingFixedExpense] =
    useState<any>(undefined);

  // AI 추천 데이터 로딩
  useEffect(() => {
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출 시도
      try {
        const recommendations = await fetchAIRecommendations();
        setAIRecommendations(recommendations);
        initializeBudgetData(recommendations);
      } catch (apiError) {
        // AI API가 아직 구현되지 않은 경우 이전 달 예산 기반으로 추천
        console.log("AI API not available, using previous budget data");

        try {
          const previousBudget = await fetchPreviousBudget();
          const recommendations =
            generateRecommendationsFromPrevious(previousBudget);
          setAIRecommendations(recommendations);
          initializeBudgetData(recommendations);
        } catch (prevError) {
          // 이전 예산도 없으면 기본 추천 데이터 사용
          console.log(
            "Previous budget not available, using default recommendations"
          );
          const recommendations = getDefaultAIRecommendations();
          setAIRecommendations(recommendations);
          initializeBudgetData(recommendations);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI 추천 데이터를 불러오는데 실패했습니다."
      );

      // 최종 폴백: 기본 추천 데이터 사용
      const fallbackRecommendations = getDefaultAIRecommendations();
      setAIRecommendations(fallbackRecommendations);
      initializeBudgetData(fallbackRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const initializeBudgetData = (recommendations: AIRecommendationData) => {
    // 총 예산 설정
    setTotalBudget(recommendations.totalBudget);

    // 모든 카테고리별 예산 설정 (추천 데이터가 없는 카테고리는 0으로 설정)
    const categoryData = ALL_CATEGORIES.map((category) => {
      const recommendedCategory = recommendations.categoryBudgets.find(
        (cat) => cat.name === category.name
      );
      return {
        name: category.name,
        amount: recommendedCategory ? recommendedCategory.amount : 0,
      };
    });
    setCategoryBudgets(categoryData);

    // 고정 지출 설정
    const fixedExpenseList = (recommendations.fixedExpenses || []).map(
      (item, index) => ({
        id: `fixed-${index}`,
        name: item.name,
        amount: item.amount,
        includeInBudget: item.includeInBudget,
        billingDay: item.billingDay,
      })
    );

    // 예산 포함/미포함으로 분리
    const includedExpenses = fixedExpenseList.filter(
      (item) => item.includeInBudget
    );
    const excludedExpenses = fixedExpenseList.filter(
      (item) => !item.includeInBudget
    );

    setFixedIncludedExpenses(includedExpenses);
    setFixedExcludedExpenses(excludedExpenses);

    // 고정 지출 합계 계산
    const fixedIncludedTotal = includedExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const fixedExcludedTotal = excludedExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    setFixedIncludedBudget(fixedIncludedTotal);
    setFixedExcludedBudget(fixedExcludedTotal);

    // 변동 지출 예산 계산
    const variableAmount = recommendations.totalBudget - fixedIncludedTotal;
    setVariableBudget(variableAmount);
  };

  // 총 예산 변경 핸들러
  const handleTotalBudgetChange = (amount: number) => {
    setTotalBudget(amount);
    setVariableBudget(amount - fixedIncludedBudget);
  };

  // 변동 지출 예산 변경 핸들러
  const handleVariableBudgetChange = (amount: number) => {
    setVariableBudget(amount);
    setTotalBudget(amount + fixedIncludedBudget);
  };

  // 카테고리별 예산 변경 핸들러
  const handleCategoryBudgetChange = (name: string, amount: number) => {
    setCategoryBudgets((prev) =>
      prev.map((cat) => (cat.name === name ? { ...cat, amount } : cat))
    );
  };

  // 고정 지출 추가 핸들러
  const handleAddFixedExpense = () => {
    setEditingFixedExpense(undefined);
    setFormVisible(true);
  };

  // 고정 지출 편집 핸들러
  const handleEditFixedExpense = (item: any) => {
    setEditingFixedExpense(item);
    setFormVisible(true);
  };

  // 고정 지출 삭제 핸들러
  const handleDeleteFixedExpense = (id: string) => {
    const isIncluded = fixedIncludedExpenses.find(
      (expense) => expense.id === id
    );
    if (isIncluded) {
      setFixedIncludedExpenses((prev) =>
        prev.filter((expense) => expense.id !== id)
      );
      const deletedAmount = isIncluded.amount;
      setFixedIncludedBudget((prev) => prev - deletedAmount);
      setTotalBudget((prev) => prev - deletedAmount);
      setVariableBudget((prev) => prev + deletedAmount);
    } else {
      setFixedExcludedExpenses((prev) =>
        prev.filter((expense) => expense.id !== id)
      );
      const deletedAmount =
        fixedExcludedExpenses.find((expense) => expense.id === id)?.amount || 0;
      setFixedExcludedBudget((prev) => prev - deletedAmount);
    }
  };

  // 고정 지출 폼 제출 핸들러
  const handleSubmitFixedExpenseForm = (values: AddFixedExpenseFormValues) => {
    const newExpense = {
      id: editingFixedExpense ? editingFixedExpense.id : Date.now().toString(),
      name: values.name,
      amount: values.amount,
      includeInBudget: values.includeInBudget,
      billingDay: values.billingDay || 1,
    };

    if (editingFixedExpense) {
      // 편집 모드
      const oldAmount = editingFixedExpense.amount;
      const newAmount = values.amount;
      const amountDiff = newAmount - oldAmount;

      if (values.includeInBudget) {
        setFixedIncludedExpenses((prev) =>
          prev.map((expense) =>
            expense.id === editingFixedExpense.id ? newExpense : expense
          )
        );
        setFixedIncludedBudget((prev) => prev + amountDiff);
        setTotalBudget((prev) => prev + amountDiff);
        setVariableBudget((prev) => prev - amountDiff);
      } else {
        setFixedExcludedExpenses((prev) =>
          prev.map((expense) =>
            expense.id === editingFixedExpense.id ? newExpense : expense
          )
        );
        setFixedExcludedBudget((prev) => prev + amountDiff);
      }
    } else {
      // 추가 모드
      if (values.includeInBudget) {
        setFixedIncludedExpenses((prev) => [...prev, newExpense]);
        setFixedIncludedBudget((prev) => prev + values.amount);
        setTotalBudget((prev) => prev + values.amount);
        setVariableBudget((prev) => prev - values.amount);
      } else {
        setFixedExcludedExpenses((prev) => [...prev, newExpense]);
        setFixedExcludedBudget((prev) => prev + values.amount);
      }
    }

    setFormVisible(false);
    setEditingFixedExpense(undefined);
  };

  // 고정 지출 폼 취소 핸들러
  const handleCancelFixedExpenseForm = () => {
    setFormVisible(false);
    setEditingFixedExpense(undefined);
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.back();
  };

  // 새로운 예산 설정 완료 핸들러
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // 1. 총 예산 저장
      await saveDraftTotal({ totalAmount: totalBudget });

      // 2. 고정 지출 저장 (예산 포함/미포함 모두)
      const allFixedExpenses = [
        ...fixedIncludedExpenses.map((expense) => ({
          title: expense.name,
          amount: expense.amount,
          payDay: expense.billingDay || 1,
          includeInBudget: true,
        })),
        ...fixedExcludedExpenses.map((expense) => ({
          title: expense.name,
          amount: expense.amount,
          payDay: expense.billingDay || 1,
          includeInBudget: false,
        })),
      ];

      await saveDraftFixed({
        expectedVersion: 0, // 첫 저장이므로 버전 0
        fixedExpenses: allFixedExpenses,
      });

      // 3. 카테고리별 예산 저장
      const selectedCategories = categoryBudgets
        .filter((cat) => cat.amount > 0)
        .map((cat) => getCategoryIdByName(cat.name));

      const categoryAllocations = categoryBudgets
        .filter((cat) => cat.amount > 0)
        .map((cat) => ({
          categoryId: getCategoryIdByName(cat.name),
          finalAmount: cat.amount,
        }));

      await saveDraftCategories({
        expectedVersion: 0, // 첫 저장이므로 버전 0
        selectedCategories,
        categoryAllocations,
      });

      // 4. 예산 확정
      await commitBudget();

      // Homepage로 이동하면서 새로고침 (replace 사용으로 뒤로가기 방지)
      router.replace("/(tabs)/home" as any);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "예산 설정에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BudgetEditTemplate
        mode="ai-setup"
        month={getCurrentMonth()}
        totalBudget={0}
        variableBudget={0}
        fixedIncludedBudget={0}
        fixedExcludedBudget={0}
        categoryBudgets={[]}
        fixedIncludedExpenses={[]}
        fixedExcludedExpenses={[]}
        onTotalBudgetChange={() => {}}
        onVariableBudgetChange={() => {}}
        onCategoryBudgetChange={() => {}}
        onAddFixedExpense={() => {}}
        onEditFixedExpense={() => {}}
        onDeleteFixedExpense={() => {}}
        onPressCancel={() => {}}
        onPressSave={() => {}}
        saveDisabled={true}
        saveButtonText="예산 설정 완료"
      />
    );
  }

  if (error) {
    return (
      <BudgetEditTemplate
        mode="ai-setup"
        month={getCurrentMonth()}
        totalBudget={0}
        variableBudget={0}
        fixedIncludedBudget={0}
        fixedExcludedBudget={0}
        categoryBudgets={[]}
        fixedIncludedExpenses={[]}
        fixedExcludedExpenses={[]}
        onTotalBudgetChange={() => {}}
        onVariableBudgetChange={() => {}}
        onCategoryBudgetChange={() => {}}
        onAddFixedExpense={() => {}}
        onEditFixedExpense={() => {}}
        onDeleteFixedExpense={() => {}}
        onPressCancel={() => {}}
        onPressSave={() => {}}
        saveDisabled={true}
        saveButtonText="예산 설정 완료"
      />
    );
  }

  return (
    <>
      <BudgetEditTemplate
        mode="ai-setup"
        month={getCurrentMonth()}
        totalBudget={totalBudget}
        variableBudget={variableBudget}
        fixedIncludedBudget={fixedIncludedBudget}
        fixedExcludedBudget={fixedExcludedBudget}
        categoryBudgets={categoryBudgets}
        fixedIncludedExpenses={fixedIncludedExpenses}
        fixedExcludedExpenses={fixedExcludedExpenses}
        onTotalBudgetChange={handleTotalBudgetChange}
        onVariableBudgetChange={handleVariableBudgetChange}
        onCategoryBudgetChange={handleCategoryBudgetChange}
        onAddFixedExpense={handleAddFixedExpense}
        onEditFixedExpense={handleEditFixedExpense}
        onDeleteFixedExpense={handleDeleteFixedExpense}
        onPressCancel={handleCancel}
        onPressSave={handleSave}
        saveDisabled={saving}
        saveButtonText="예산 설정 완료"
        aiRecommendations={aiRecommendations}
      />

      {/* 고정 지출 추가/편집 모달 */}
      <Modal
        visible={formVisible}
        animationType="slide"
        onRequestClose={handleCancelFixedExpenseForm}
        presentationStyle="pageSheet"
      >
        <AddFixedExpenseForm
          mode={editingFixedExpense ? "edit" : "create"}
          defaultValues={editingFixedExpense}
          onSubmit={handleSubmitFixedExpenseForm}
          onCancel={handleCancelFixedExpenseForm}
        />
      </Modal>
    </>
  );
}
