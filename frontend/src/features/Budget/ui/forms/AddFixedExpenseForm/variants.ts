export const formTitle = (mode: "create" | "edit") =>
  mode === "edit" ? "고정 지출 수정" : "고정 지출 추가";

export const fieldLabels = {
  name: "* 항목명",
  amount: "* 금액",
  include: "* 예산 포함 여부",
  billingDay: "* 결제일",
  submit: (mode: "create" | "edit") => (mode === "edit" ? "수정" : "추가"),
} as const;
