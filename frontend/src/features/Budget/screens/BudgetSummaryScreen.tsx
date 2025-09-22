import { useCallback, useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import BudgetSummaryTemplate from "~features/Budget/templates/BudgetSummaryTemplate";
import BudgetConfirmModal from "~features/Budget/ui/molecules/BudgetConfirmModal";
import { useBudgetDraft } from "~features/Budget/context/BudgetDraftContext";
import type {
  CategoryBudgetItem,
  FixedExpenseItem,
} from "~features/Budget/templates/BudgetSummaryTemplate/types";
import type { CategoryName } from "@/shared/constants/categoryIcons";

import * as SecureStore from "expo-secure-store";
// 카테고리 이름을 ID로 매핑하는 함수 (데이터베이스와 일치)
const getCategoryId = (name: CategoryName): number => {
  const categoryMap: Record<CategoryName, number> = {
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
  return categoryMap[name] || 1;
};

export default function BudgetSummaryScreen() {
  // 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    totalAmount,
    fixedExpenses,
    categoryAllocations,
    commit,
    isCommitting,
    commitError,
    loadDraftData,
  } = useBudgetDraft();

  // 데이터 로딩 및 Context 상태 확인
  useEffect(() => {
    loadDraftData();

  }, [
    totalAmount,
    fixedExpenses,
    categoryAllocations,
    isCommitting,
    commitError,
    loadDraftData,
  ]);

  // 고정지출 (예산 포함/미포함) 분리
  const fixedIncludedExpenses: FixedExpenseItem[] = useMemo(() => {
    return fixedExpenses
      .filter((item) => item.includeInBudget !== false)
      .map((item, index) => ({
        id: String(index),
        name: item.title,
        amount: item.amount,
        includeInBudget: true,
        billingDay: item.payDay,
      }));
  }, [fixedExpenses]);

  const fixedExcludedExpenses: FixedExpenseItem[] = useMemo(() => {
    return fixedExpenses
      .filter((item) => item.includeInBudget === false)
      .map((item, index) => ({
        id: String(index),
        name: item.title,
        amount: item.amount,
        includeInBudget: false,
        billingDay: item.payDay,
      }));
  }, [fixedExpenses]);

  // 고정지출 예산 합계
  const fixedIncludedBudget = useMemo(
    () => fixedIncludedExpenses.reduce((sum, item) => sum + item.amount, 0),
    [fixedIncludedExpenses]
  );

  const fixedExcludedBudget = useMemo(
    () => fixedExcludedExpenses.reduce((sum, item) => sum + item.amount, 0),
    [fixedExcludedExpenses]
  );

  // 카테고리별 예산 데이터 변환 (데이터베이스와 일치)
  const categoryBudgetsData: CategoryBudgetItem[] = useMemo(() => {
    const idToName: Record<number, CategoryName> = {
      1: "식비",
      2: "카페/간식",
      3: "술/유흥",
      4: "생활",
      5: "쇼핑",
      6: "뷰티/미용",
      7: "교통",
      8: "자동차",
      9: "의료/건강",
      10: "문화",
    };

    return categoryAllocations.map((allocation) => ({
      name: idToName[allocation.categoryId] || "식비",
      amount: allocation.finalAmount,
    }));
  }, [categoryAllocations]);

  // 변동 지출 예산 합계
  const variableBudget = useMemo(
    () => categoryBudgetsData.reduce((sum, item) => sum + item.amount, 0),
    [categoryBudgetsData]
  );

  // 현재 월 (동적으로 계산)
  const currentMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 0-based이므로 +1
    return `${month}월`;
  }, []);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);

  const goNext = useCallback(() => {
    // 예산 확정 확인 모달 표시
    setShowConfirmModal(true);
  }, []);

  const handleConfirmBudget = useCallback(async () => {

    try {
      const result = await commit();

      setShowConfirmModal(false);
      router.push("/(tabs)/home");
    } catch (error) {
      // 에러 처리 (토스트 메시지 등)
      setShowConfirmModal(false); // 모달은 닫고 에러 메시지 표시
    }
  }, [commit, totalAmount, fixedExpenses, categoryAllocations]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return (
    <>
      <BudgetSummaryTemplate
        month={currentMonth}
        totalBudget={totalAmount || 0}
        variableBudget={variableBudget}
        fixedIncludedBudget={fixedIncludedBudget}
        fixedExcludedBudget={fixedExcludedBudget}
        categoryBudgets={categoryBudgetsData}
        fixedIncludedExpenses={fixedIncludedExpenses}
        fixedExcludedExpenses={fixedExcludedExpenses}
        onPressPrev={goPrev}
        onPressNext={goNext}
        stepIndex={4}
        stepTotal={5}
        nextLabel="확정"
      />

      <BudgetConfirmModal
        visible={showConfirmModal}
        month={currentMonth}
        totalBudget={totalAmount || 0}
        onConfirm={handleConfirmBudget}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}
