import type { ButtonVariant } from "./types";

export const ButtonVariants = {
  primary: "px-4 py-2 rounded bg-blue-500 text-white",
  secondary: "px-4 py-2 rounded bg-gray-200 text-gray-900",
  danger: "px-4 py-2 rounded bg-red-500 text-white",
} as const satisfies Record<ButtonVariant, string>;
