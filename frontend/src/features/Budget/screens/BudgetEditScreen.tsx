import React, { useState, useEffect, useMemo } from "react";
import { router } from "expo-router";
import { Modal } from "react-native";
import BudgetEditTemplate from "~features/Budget/templates/BudgetEditTemplate";
import AddFixedExpenseForm from "~features/Budget/ui/forms/AddFixedExpenseForm";
import {
  fetchFixedIncludedTotal,
  fetchCategoryAllocations,
  fetchFixedExpenseList,
} from "~features/Budget/api/fetchers";
import { fetchBudgetTotal } from "~features/Home/api/fetchers";
import type { BudgetEditTemplateProps } from "~features/Budget/templates/BudgetEditTemplate/types";
import type { AddFixedExpenseFormValues } from "~features/Budget/ui/forms/AddFixedExpenseForm/types";

// 카테고리 ID를 이름으로 변환하는 함수
const getCategoryNameById = (categoryId: number): string => {
  const categoryMap: Record<number, string> = {
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
  return categoryMap[categoryId] || "기타";
};

// 현재 월을 가져오는 함수
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getMonth() + 1}월`;
};

export default function BudgetEditScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 원본 데이터 (변경 감지용)
  const [originalData, setOriginalData] = useState<any>(null);

  // 데이터 로딩
  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 예산 데이터를 병렬로 가져오기
      const [
        totalResponse,
        fixedResponse,
        categoryResponse,
        fixedListResponse,
      ] = await Promise.all([
        fetchBudgetTotal(),
        fetchFixedIncludedTotal(),
        fetchCategoryAllocations(),
        fetchFixedExpenseList(),
      ]);

      // 총 예산
      const totalAmount = totalResponse?.totalAmount || 0;
      setTotalBudget(totalAmount);

      // 고정 지출 (예산 포함)
      const fixedIncludedTotal = fixedResponse?.fixedIncludedTotal || 0;
      setFixedIncludedBudget(fixedIncludedTotal);

      // 변동 지출 예산 계산 (총 예산 - 고정 지출)
      const variableAmount = totalAmount - fixedIncludedTotal;
      setVariableBudget(variableAmount);

      // 카테고리별 예산
      const categoryData = (categoryResponse || []).map((cat: any) => ({
        name: getCategoryNameById(cat.categoryId),
        amount: cat.finalAmount || 0,
      }));
      setCategoryBudgets(categoryData);

      // 고정 지출 상세 목록 처리
      const fixedExpenseList = (fixedListResponse || []).map(
        (item: any, index: number) => ({
          id: `fixed-${index}`, // 임시 ID (백엔드에서 ID를 제공하지 않음)
          name: item.title,
          amount: item.amount || 0,
          includeInBudget: item.includeInBudget !== false, // null이면 true로 처리
          billingDay: item.payDay,
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

      // 원본 데이터 저장
      setOriginalData({
        totalBudget: totalAmount,
        variableBudget: variableAmount,
        fixedIncludedBudget: fixedIncludedTotal,
        categoryBudgets: categoryData,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "예산 데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 변경사항 감지
  const hasChanges = useMemo(() => {
    if (!originalData) return false;

    return (
      totalBudget !== originalData.totalBudget ||
      variableBudget !== originalData.variableBudget ||
      fixedIncludedBudget !== originalData.fixedIncludedBudget ||
      JSON.stringify(categoryBudgets) !==
        JSON.stringify(originalData.categoryBudgets)
    );
  }, [
    totalBudget,
    variableBudget,
    fixedIncludedBudget,
    categoryBudgets,
    originalData,
  ]);

  // 총 예산 변경 핸들러
  const handleTotalBudgetChange = (amount: number) => {
    setTotalBudget(amount);
    // 변동 지출 예산도 자동으로 재계산
    setVariableBudget(amount - fixedIncludedBudget);
  };

  // 변동 지출 예산 변경 핸들러
  const handleVariableBudgetChange = (amount: number) => {
    setVariableBudget(amount);
    // 총 예산도 자동으로 재계산
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
    // 고정 지출 삭제 로직
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

  // 저장 핸들러
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // TODO: 실제 저장 로직 구현
      // 1. 총 예산 저장
      // 2. 카테고리별 예산 저장
      // 3. 고정 지출 저장
      // 4. 커밋

      // 임시로 성공 처리
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Homepage로 이동하면서 새로고침 (replace 사용으로 뒤로가기 방지)
      router.replace("/(tabs)/home" as any);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "예산 저장에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BudgetEditTemplate
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
      />
    );
  }

  if (error) {
    return (
      <BudgetEditTemplate
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
      />
    );
  }

  return (
    <>
      <BudgetEditTemplate
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
        saveDisabled={!hasChanges || saving}
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
