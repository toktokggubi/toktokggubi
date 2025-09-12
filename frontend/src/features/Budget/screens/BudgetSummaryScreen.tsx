import { useCallback, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import BudgetSummaryTemplate from "~features/Budget/templates/BudgetSummaryTemplate";
import BudgetConfirmModal from "~features/Budget/ui/molecules/BudgetConfirmModal";
import type { 
  CategoryBudgetItem, 
  FixedExpenseItem 
} from "~features/Budget/templates/BudgetSummaryTemplate/types";
import type { CategoryName } from "@/shared/constants/categoryIcons";

// 🔄 REDIS 전환 시 수정할 부분들:
// 1) useLocalSearchParams 제거하고 draft store/query 훅으로 교체
//    - useBudgetDraftQuery, useBudgetDraftData, useBudgetDraftActions
// 2) 데이터는 store 기준으로 관리
// 3) goNext에서는 파라미터 이동 대신 Redis 저장 후 커밋

type FixedExpenseParam = {
  id: string;
  name: string;
  amount: number;
  billingDay?: number;
  includeInBudget: boolean;
};

export default function BudgetSummaryScreen() {
  // 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 현재는 이전 단계에서 파라미터로 전달받음
  const { 
    totalAmount, 
    fixedExpenses, 
    selectedCategories,
    categoryBudgets 
  } = useLocalSearchParams<{
    totalAmount?: string;
    fixedExpenses?: string;
    selectedCategories?: string; // JSON-encoded CategoryName[]
    categoryBudgets?: string; // JSON-encoded CategoryBudgetItem[]
  }>();

  // 총예산
  const totalBudget = totalAmount ? parseInt(totalAmount, 10) : 0;

  // 고정지출 파싱
  const parsedFixed: FixedExpenseParam[] = useMemo(() => {
    if (!fixedExpenses) return [];
    try {
      return JSON.parse(
        decodeURIComponent(fixedExpenses)
      ) as FixedExpenseParam[];
    } catch {
      return [];
    }
  }, [fixedExpenses]);

  // 고정지출 (예산 포함/미포함) 분리
  const fixedIncludedExpenses: FixedExpenseItem[] = useMemo(() => {
    return parsedFixed
      .filter(item => item.includeInBudget !== false)
      .map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        includeInBudget: true,
        billingDay: item.billingDay,
      }));
  }, [parsedFixed]);

  const fixedExcludedExpenses: FixedExpenseItem[] = useMemo(() => {
    return parsedFixed
      .filter(item => item.includeInBudget === false)
      .map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        includeInBudget: false,
        billingDay: item.billingDay,
      }));
  }, [parsedFixed]);

  // 고정지출 예산 합계
  const fixedIncludedBudget = useMemo(
    () => fixedIncludedExpenses.reduce((sum, item) => sum + item.amount, 0),
    [fixedIncludedExpenses]
  );

  const fixedExcludedBudget = useMemo(
    () => fixedExcludedExpenses.reduce((sum, item) => sum + item.amount, 0),
    [fixedExcludedExpenses]
  );

  // 카테고리별 예산 파싱
  const categoryBudgetsData: CategoryBudgetItem[] = useMemo(() => {
    if (!categoryBudgets) return [];
    try {
      return JSON.parse(
        decodeURIComponent(categoryBudgets)
      ) as CategoryBudgetItem[];
    } catch {
      return [];
    }
  }, [categoryBudgets]);

  // 변동 지출 예산 합계
  const variableBudget = useMemo(
    () => categoryBudgetsData.reduce((sum, item) => sum + item.amount, 0),
    [categoryBudgetsData]
  );

  // 현재 월 (실제로는 현재 날짜 기준으로 계산하거나 파라미터로 받아야 함)
  const currentMonth = "8월"; // TODO: 실제 월 계산 로직 추가

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);

  const goNext = useCallback(() => {
    // 예산 확정 확인 모달 표시
    setShowConfirmModal(true);
  }, []);

  const handleConfirmBudget = useCallback(() => {
    // 🔄 REDIS 전환 시:
    // commitMutation.mutate(...)
    // 완료 후 홈으로 이동

    // 현재: 홈으로 이동
    setShowConfirmModal(false);
    router.push("/(tabs)/home");
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return (
    <>
      <BudgetSummaryTemplate
        month={currentMonth}
        totalBudget={totalBudget}
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
        totalBudget={totalBudget}
        onConfirm={handleConfirmBudget}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}
