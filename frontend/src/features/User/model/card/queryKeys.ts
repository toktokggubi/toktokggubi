export const cardQueryKeys = {
  all: ["userCards"] as const,
  benefits: (userCardId: number) => ["cardBenefits", userCardId] as const,
};
