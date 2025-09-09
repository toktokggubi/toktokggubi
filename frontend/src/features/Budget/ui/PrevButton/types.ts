import { PressableProps } from "react-native";

export interface PrevButtonProps {
  label?: string;
  onPress: NonNullable<PressableProps["onPress"]>;
  disabled?: boolean;
  tone?: "link" | "filled";
}
