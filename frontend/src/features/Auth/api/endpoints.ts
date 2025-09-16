export const AUTH_ENDPOINTS = {
  kakaoLogin: "/auth/kakao/login", // UM-6, UM-5
  signup: "/auth/signup", // UM-1
  signupComplete: "/auth/signup/complete", // UM-10
  login: "/auth/login", // UM-4
  passwordReset: "/auth/password/reset", // UM-2
  passwordChange: "/user/password", // UM-3
  logout: "/auth/logout", // UM-7
  deleteAccount: "/user/delete", // UM-8
  tokenRefresh: "/auth/token/refresh", // UM-9
  profile: "/user/profile", // UM-11, UM-12
  consents: "/user/consents", // UM-13
  agreements: "/user/agreements", // UM-14
  pushTokens: "/user/push-tokens", // UM-15
  notificationsCategory: "/user/notifications/categories", // UM-15-2
} as const;
