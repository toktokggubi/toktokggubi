import { http } from "@/shared/api/http";
import { PAY_ENDPOINTS } from "./endpoints";

// 위치 정보를 서버로 전송하는 API
export async function pushLocation(categoryId: number) {
  const { data } = await http.post(PAY_ENDPOINTS.pushLocation, null, {
    params: { categoryId }
  });
  return data;
}

// 결제 API
export interface PaymentRequest {
  userCardId: number;
  merchantId?: number | null;  // 선택적 필드 (QR에 있으면 사용)
  merchantName: string;
  amount: number;
}

export interface PaymentResponse {
  transactionUniqueNo: string;
  status: string;              // APPROVED / CANCEL / DECLINED
  userCardId: number;
  merchantId: number;
  merchantName: string;
  originalAmount: number;
  discountRate: number;        // 적용된 퍼센트(없으면 0)
  discountAmount: number;      // 원
  finalAmount: number;         // 원
  transactionYmd: string;      // YYYYMMDD
  transactionHms: string;      // HHMMSS
  createdAt: string;
}

export async function processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  const { data } = await http.post<PaymentResponse>(PAY_ENDPOINTS.payment, paymentData);
  return data;
}