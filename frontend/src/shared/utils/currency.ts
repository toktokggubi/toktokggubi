import * as SecureStore from "expo-secure-store";

export const krw = (n: number) => `${n.toLocaleString("ko-KR")} 원`;
export const onlyNum = (s: string) =>
  Number((s || "").replace(/[^\d]/g, "")) || 0;

export const formatCurrency = (amount: number): string => {
  const formatted = Math.abs(amount).toLocaleString("ko-KR");
  return amount < 0 ? `-${formatted}원` : `+${formatted}원`;
};

// 토큰 존재 여부 확인
export const hasValidToken = async (): Promise<boolean> => {
  try {
    const accessToken = await SecureStore.getItemAsync("access_token");
    return !!accessToken;
  } catch (error) {
    console.error("토큰 확인 중 오류:", error);
    return false;
  }
};