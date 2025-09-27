import { useState, useCallback, useMemo, useEffect } from 'react';
import type { CategoryBudgetItem } from "./types";

// 유효성 검사 에러 타입
export interface ValidationError {
  field: string;
  message: string;
}

// 유효성 검사 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// 예산 데이터 타입
export interface BudgetData {
  totalBudget: number;
  variableBudget: number;
  fixedIncludedBudget: number;
  categoryBudgets: CategoryBudgetItem[];
}

// 합계 유효성 검사 함수들 (간소화)
export const validateBudgetSums = (data: BudgetData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 개별 카테고리 예산 검증만 수행 (헤더 값들은 자동 계산되므로)
  data.categoryBudgets.forEach((cat, index) => {
    if (cat.amount < 0) {
      errors.push({
        field: `category_${index}`,
        message: `💰 ${cat.name} 예산은 0원 이상이어야 해요!`
      });
    }
    if (cat.amount > 10000000) {
      errors.push({
        field: `category_${index}`,
        message: `💰 ${cat.name} 예산이 너무 커요! 최대 1천만원까지 가능해요`
      });
    }
    // 0원은 허용하므로 별도 검증 없음
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 개별 필드 유효성 검사
export const validateField = (field: string, value: number, data: BudgetData): string | null => {
  switch (field) {
    case 'totalBudget':
      if (value < 0) return '💰 금액은 0원 이상이어야 해요!';
      if (value > 10000000) return '💰 너무 큰 금액이에요! 최대 1천만원까지 가능해요';
      // 0원 허용 (카테고리 예산이 모두 0원일 수 있음)
      break;
    
    case 'variableBudget':
      if (value < 0) return '💰 금액은 0원 이상이어야 해요!';
      if (value > data.totalBudget) return '💰 총 예산보다 많을 수 없어요!';
      break;
    
    case 'categoryBudget':
      if (value < 0) return '💰 금액은 0원 이상이어야 해요!';
      const categoryTotal = data.categoryBudgets.reduce((sum, cat) => sum + cat.amount, 0);
      if (categoryTotal > data.variableBudget) {
        return `💰 카테고리 예산이 변동 지출 예산을 초과해요!`;
      }
      break;
  }

  return null;
};

// 실시간 합계 검증 (디바운싱 적용)
export const useBudgetSumValidation = (data: BudgetData) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  });

  const validateSums = useCallback(() => {
    const result = validateBudgetSums(data);
    setValidationResult(result);
    return result;
  }, [data]);

  // 디바운싱된 검증
  const debouncedValidate = useMemo(
    () => debounce(validateSums, 300),
    [validateSums]
  );

  useEffect(() => {
    debouncedValidate();
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);

  return {
    validationResult,
    validateSums
  };
};

// 디바운스 유틸리티 함수
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  
  return debounced;
}
