import { PressableProps } from "react-native";

export interface NextButtonProps {
  label?: string;
  onPress: NonNullable<PressableProps["onPress"]>;
  disabled?: boolean;
  tone?: "link" | "filled";
}
