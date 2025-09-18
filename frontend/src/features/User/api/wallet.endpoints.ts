export const WALLET_ENDPOINTS = {
  cards: "/wallet/cards",
  cardBenefits: (userCardId: number) => `/wallet/cards/${userCardId}/benefits`,
} as const;
