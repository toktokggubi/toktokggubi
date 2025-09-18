// model/card/hooks.ts의 구현을 그대로 재노출해서 경로 호환 유지
export { useCardBenefits } from "@/features/User/model/card/hooks";

export const benefitQueryKeys = {
  root: ["cardBenefits"] as const,
  byCard: (userCardId: number) =>
    [...benefitQueryKeys.root, userCardId] as const,
};
