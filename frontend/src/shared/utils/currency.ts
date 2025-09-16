export const krw = (n: number) => `${n.toLocaleString("ko-KR")} 원`;
export const onlyNum = (s: string) =>
  Number((s || "").replace(/[^\d]/g, "")) || 0;

export const formatCurrency = (amount: number): string => {
  const formatted = Math.abs(amount).toLocaleString("ko-KR");
  return amount < 0 ? `-${formatted}원` : `+${formatted}원`;
};