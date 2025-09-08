import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends PressableProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}
