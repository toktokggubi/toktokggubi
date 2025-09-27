import React, { useState, useEffect, useMemo } from "react";
import { router } from "expo-router";
import { Modal } from "react-native";
import BudgetEditTemplate from "~features/Budget/templates/BudgetEditTemplate";
import AddFixedExpenseForm from "~features/Budget/ui/forms/AddFixedExpenseForm";
import {
  fetchFixedIncludedTotal,
  fetchCategoryAllocations,
  fetchFixedExpenseList,
  saveAllBudget
} from "~features/Budget/api/fetchers";
import { fetchBudgetTotal } from "~features/Home/api/fetchers";
import type { BudgetEditTemplateProps } from "~features/Budget/templates/BudgetEditTemplate/types";
import type { AddFixedExpenseFormValues } from "~features/Budget/ui/forms/AddFixedExpenseForm/types";
import type { BudgetAllSaveRequest } from "~features/Budget/types/budget.types";

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
  return categoryMap[categoryId] || '기타';
};

// 카테고리 이름을 ID로 변환하는 함수
const getCategoryIdByName = (categoryName: string): number => {
  const nameMap: Record<string, number> = {
    '식비': 1,
    '카페/간식': 2,
    '술/유흥': 3,
    '생활': 4,
    '쇼핑': 5,
    '뷰티/미용': 6,
    '교통': 7,
    '자동차': 8,
    '의료/건강': 9,
    '문화': 10,
    '기타': 11,
  };
  return nameMap[categoryName] || 11;
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

      // 카테고리별 예산 - 모든 카테고리 표시 (기타 제외)
      const allCategories = [
        { id: 1, name: '식비' },
        { id: 2, name: '카페/간식' },
        { id: 3, name: '술/유흥' },
        { id: 4, name: '생활' },
        { id: 5, name: '쇼핑' },
        { id: 6, name: '뷰티/미용' },
        { id: 7, name: '교통' },
        { id: 8, name: '자동차' },
        { id: 9, name: '의료/건강' },
        { id: 10, name: '문화' }
      ];

      // API에서 받은 카테고리 데이터를 맵으로 변환
      const apiCategoryMap = new Map();
      (categoryResponse || []).forEach((cat: any) => {
        apiCategoryMap.set(cat.categoryId, cat.finalAmount || 0);
      });

      // 모든 카테고리를 표시하되, API 데이터가 있으면 그 값을, 없으면 0을 사용
      const categoryData = allCategories.map(category => ({
        name: category.name,
        amount: apiCategoryMap.get(category.id) || 0
      }));
      
      setCategoryBudgets(categoryData);

      // 고정 지출 상세 목록 처리
      const fixedExpenseList = (fixedListResponse || []).map((item: any, index: number) => ({
        id: `fixed-${index}`, // 임시 ID (백엔드에서 ID를 제공하지 않음)
        name: item.title,
        amount: item.amount || 0,
          includeInBudget: item.includeInBudget !== false, // null이거나 true인 경우 예산 포함
        billingDay: item.payDay
      }));

      // 예산 포함/미포함으로 분리
      const includedExpenses = fixedExpenseList.filter(
        (item) => item.includeInBudget
      );
      const excludedExpenses = fixedExpenseList.filter(
        (item) => !item.includeInBudget
      );

      setFixedIncludedExpenses(includedExpenses);
      setFixedExcludedExpenses(excludedExpenses);

      // 고정 지출 (예산 미포함) 총액 계산
      const fixedExcludedTotal = excludedExpenses.reduce((sum, item) => sum + item.amount, 0);
      setFixedExcludedBudget(fixedExcludedTotal);

      // 원본 데이터 저장
      setOriginalData({
        totalBudget: totalAmount,
        variableBudget: variableAmount,
        fixedIncludedBudget: fixedIncludedTotal,
        fixedExcludedBudget: fixedExcludedTotal,
        categoryBudgets: categoryData,
        fixedIncludedExpenses: includedExpenses,
        fixedExcludedExpenses: excludedExpenses
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
    
    // 카테고리별 예산 변경 감지
    const categoryChanged = JSON.stringify(categoryBudgets) !== JSON.stringify(originalData.categoryBudgets);
    
    // 고정지출 상세 항목 변경 감지
    const fixedIncludedChanged = JSON.stringify(fixedIncludedExpenses) !== JSON.stringify(originalData.fixedIncludedExpenses);
    const fixedExcludedChanged = JSON.stringify(fixedExcludedExpenses) !== JSON.stringify(originalData.fixedExcludedExpenses);
    
    return categoryChanged || fixedIncludedChanged || fixedExcludedChanged;
  }, [categoryBudgets, fixedIncludedExpenses, fixedExcludedExpenses, originalData]);

  // 실시간으로 헤더 값들 자동 업데이트
  useEffect(() => {
    // 고정 지출 (예산 포함) 총액 계산
    const currentFixedIncludedTotal = fixedIncludedExpenses.reduce((sum, item) => sum + item.amount, 0);
    setFixedIncludedBudget(currentFixedIncludedTotal);
    
    // 고정 지출 (예산 미포함) 총액 계산
    const currentFixedExcludedTotal = fixedExcludedExpenses.reduce((sum, item) => sum + item.amount, 0);
    setFixedExcludedBudget(currentFixedExcludedTotal);
    
    // 카테고리별 예산 총액 계산
    const currentCategoryTotal = categoryBudgets.reduce((sum, cat) => sum + cat.amount, 0);
    
    // 변동 지출 예산 = 카테고리별 예산 총액
    setVariableBudget(currentCategoryTotal);
    
    // 총 예산 = 변동 지출 예산 + 고정 지출 (예산 포함)
    setTotalBudget(currentCategoryTotal + currentFixedIncludedTotal);
  }, [fixedIncludedExpenses, fixedExcludedExpenses, categoryBudgets]);

  // 카테고리별 예산 변경 핸들러
  const handleCategoryBudgetChange = (name: string, amount: number) => {
    setCategoryBudgets((prev) =>
      prev.map((cat) => (cat.name === name ? { ...cat, amount } : cat))
    );
    // useEffect가 자동으로 헤더 값들을 업데이트함
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
      setFixedIncludedExpenses(prev => prev.filter(expense => expense.id !== id));
    } else {
      setFixedExcludedExpenses(prev => prev.filter(expense => expense.id !== id));
    }
    // useEffect가 자동으로 헤더 값들을 업데이트함
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
      // 편집 모드 - 기존 항목 제거 후 새 항목 추가
      const wasIncluded = editingFixedExpense.includeInBudget;
      
      if (wasIncluded) {
        setFixedIncludedExpenses(prev => prev.filter(expense => expense.id !== editingFixedExpense.id));
      } else {
        setFixedExcludedExpenses(prev => prev.filter(expense => expense.id !== editingFixedExpense.id));
      }
    }

    // 새 항목 추가
    if (values.includeInBudget) {
      setFixedIncludedExpenses(prev => [...prev, newExpense]);
    } else {
      setFixedExcludedExpenses(prev => [...prev, newExpense]);
    }

    // useEffect가 자동으로 헤더 값들을 업데이트함
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

      // 1. 고정 지출 데이터 변환 (예산 포함 + 미포함 합치기)
      const allFixedExpenses = [
        ...fixedIncludedExpenses,
        ...fixedExcludedExpenses
      ].map(expense => ({
        title: expense.name,
        amount: expense.amount,
        payDay: expense.billingDay || 1,
        includeInBudget: expense.includeInBudget
      }));

      // 2. 카테고리별 예산 데이터 변환
      const categoryAllocations = categoryBudgets.map(category => ({
        categoryId: getCategoryIdByName(category.name),
        finalAmount: category.amount
      }));

      // 3. 선택된 카테고리 ID 목록
      const selectedCategories = categoryAllocations.map(cat => cat.categoryId);

      // 4. API 요청 데이터 구성
      const saveRequest: BudgetAllSaveRequest = {
        totalAmount: totalBudget,
        fixedExpenses: allFixedExpenses,
        selectedCategories: selectedCategories,
        categoryAllocations: categoryAllocations
      };

      // 5. API 호출
      const response = await saveAllBudget(saveRequest);
      
      console.log('예산 저장 성공:', response);

      // 6. Homepage로 이동하면서 새로고침 (replace 사용으로 뒤로가기 방지)
      router.replace('/(tabs)/home' as any);
      
    } catch (err) {
      console.error('예산 저장 실패:', err);
      setError(err instanceof Error ? err.message : '예산 저장에 실패했습니다.');
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
        onTotalBudgetChange={() => {}}
        onVariableBudgetChange={() => {}}
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
