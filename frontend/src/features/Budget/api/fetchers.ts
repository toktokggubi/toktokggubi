import { http } from "@/shared/api/http";
import { BUDGET_ENDPOINTS } from "./endpoints";
import type {
  DraftTotalRequest,
  DraftFixedRequest,
  DraftCategoriesRequest,
  DraftSaveResponse,
  BudgetCommitResponse,
} from "../types/budget.types";

// 예산 설정 여부 확인을 위한 타입
export interface BudgetStatusResponse {
  totalAmount: number;
}

// 고정지출 총액 응답 타입
export interface FixedIncludedTotalResponse {
  fixedIncludedTotal: number;
}

// 카테고리별 예산 응답 타입
export interface CategoryAllocation {
  categoryId: number;
  finalAmount: number;
}

// BD-1 총예산 입력(redis)
export async function saveDraftTotal(dto: DraftTotalRequest): Promise<DraftSaveResponse> {
  console.log('=== saveDraftTotal API 호출 ===');
  console.log('요청 데이터:', dto);
  console.log('엔드포인트:', BUDGET_ENDPOINTS.saveDraftTotal);
  
  const { data } = await http.post(BUDGET_ENDPOINTS.saveDraftTotal, dto);
  
  console.log('=== saveDraftTotal API 응답 ===');
  console.log('응답 데이터:', data);
  
  return data;
}

// BD-3 고정지출 입력(redis)
export async function saveDraftFixed(dto: DraftFixedRequest): Promise<DraftSaveResponse> {
  console.log('=== saveDraftFixed API 호출 ===');
  console.log('요청 데이터:', dto);
  console.log('엔드포인트:', BUDGET_ENDPOINTS.saveDraftFixed);
  
  const { data } = await http.post(BUDGET_ENDPOINTS.saveDraftFixed, dto);
  
  console.log('=== saveDraftFixed API 응답 ===');
  console.log('응답 데이터:', data);
  
  return data;
}

// BD-6 카테고리 선택/금액 수정(redis)
export async function saveDraftCategories(dto: DraftCategoriesRequest): Promise<DraftSaveResponse> {
  console.log('=== saveDraftCategories API 호출 ===');
  console.log('요청 데이터:', dto);
  console.log('엔드포인트:', BUDGET_ENDPOINTS.saveDraftCategories);

  const { data } = await http.post(BUDGET_ENDPOINTS.saveDraftCategories, dto);

  console.log('=== saveDraftCategories API 응답 ===');
  console.log('응답 데이터:', data);

  return data;
}

// BD-6 마지막 버튼 (commit)
export async function commitBudget(): Promise<BudgetCommitResponse> {
  console.log('=== commitBudget API 호출 ===');
  console.log('요청 데이터: {}');
  console.log('엔드포인트:', BUDGET_ENDPOINTS.commit);

  const { data } = await http.post(BUDGET_ENDPOINTS.commit, {});

  console.log('=== commitBudget API 응답 ===');
  console.log('응답 데이터:', data);
  console.log('응답 데이터 타입:', typeof data);
  console.log('응답 데이터 키들:', Object.keys(data || {}));
  
  // 안전한 데이터 접근
  if (data) {
    console.log('DB 저장 완료 - 상태:', data.status);
    console.log('DB 저장 완료 - 예산 ID:', data.budgetId);
    console.log('DB 저장 완료 - 사용자 ID:', data.userId);
    console.log('DB 저장 완료 - 예산 년월:', data.budgetYm);
    console.log('DB 저장 완료 - 총 금액:', data.totalAmount);
    console.log('DB 저장 완료 - 고정지출 수:', data.fixedExpenseCount);
    console.log('DB 저장 완료 - 카테고리 수:', data.categoryCount);
  } else {
    console.log('=== 응답 데이터가 null 또는 undefined ===');
  }

  return data;
}

// 고정지출 총액 조회
export async function fetchFixedIncludedTotal(): Promise<FixedIncludedTotalResponse> {
  const { data } = await http.get("/budget/fixed");
  return data;
}

// 카테고리별 예산 조회
export async function fetchCategoryAllocations(): Promise<CategoryAllocation[]> {
  const { data } = await http.get("/budget/category");
  return data;
}

// 예산 설정 여부 확인 (총예산, 고정지출, 카테고리별 예산 중 하나라도 있으면 설정된 것으로 판단)
export async function checkBudgetStatus(): Promise<BudgetStatusResponse> {
  console.log('=== checkBudgetStatus API 호출 ===');
  
  try {
    // 모든 예산 관련 API를 병렬로 호출
    const [totalResponse, fixedResponse, categoryResponse] = await Promise.allSettled([
      http.get(BUDGET_ENDPOINTS.getTotalAmount),
      fetchFixedIncludedTotal(),
      fetchCategoryAllocations()
    ]);

    console.log('=== checkBudgetStatus API 응답 ===');
    console.log('총예산 응답:', totalResponse);
    console.log('고정지출 응답:', fixedResponse);
    console.log('카테고리별 예산 응답:', categoryResponse);

    // 각 응답에서 금액 추출
    const totalAmount = totalResponse.status === 'fulfilled' ? totalResponse.value.data.totalAmount : 0;
    const fixedAmount = fixedResponse.status === 'fulfilled' ? fixedResponse.value.fixedIncludedTotal : 0;
    const categoryAmount = categoryResponse.status === 'fulfilled' 
      ? categoryResponse.value.reduce((sum: number, cat: CategoryAllocation) => sum + cat.finalAmount, 0)
      : 0;

    console.log('총예산:', totalAmount);
    console.log('고정지출:', fixedAmount);
    console.log('카테고리별 예산 합계:', categoryAmount);

    // 모든 예산이 0이면 예산이 설정되지 않은 것으로 판단
    if (totalAmount === 0 && fixedAmount === 0 && categoryAmount === 0) {
      console.log('모든 예산이 0 - 예산 설정되지 않음');
      throw new Error('BUDGET_NOT_SET');
    }

    // 하나라도 있으면 설정된 것으로 판단 (총예산을 반환)
    return { totalAmount };
    
  } catch (error: any) {
    console.log('=== checkBudgetStatus API 에러 ===');
    console.log('에러:', error);
    
    // BUDGET_NOT_SET 에러는 그대로 전달
    if (error?.message === 'BUDGET_NOT_SET') {
      throw error;
    }
    
    // 404 에러는 예산이 설정되지 않음을 의미
    if (error?.response?.status === 404) {
      throw new Error('BUDGET_NOT_FOUND');
    }
    
    throw error;
  }
}
