export const krw = (n: number) => `${n.toLocaleString("ko-KR")} 원`;
export const onlyNum = (s: string) =>
  Number((s || "").replace(/[^\d]/g, "")) || 0;
