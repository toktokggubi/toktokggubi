import type { ReactNode, HTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
}
