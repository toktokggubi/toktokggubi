import { http } from "@/shared/api/http";
import { BUDGET_ENDPOINTS } from "./endpoints";
import type {
  DraftTotalRequest,
  DraftFixedRequest,
  DraftCategoriesRequest,
  DraftSaveResponse,
  BudgetCommitResponse,
} from "../types/budget.types";

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
