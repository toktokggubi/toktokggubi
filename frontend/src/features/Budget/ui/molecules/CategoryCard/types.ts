import type { ImageSourcePropType } from "react-native";
import type { CategoryName } from "@/shared/constants/categoryIcons";

export interface CategoryCardProps {
  name: CategoryName;
  label: string;
  icon: ImageSourcePropType;
  selected?: boolean;
  disabled?: boolean;
  onPress?: (name: CategoryName) => void;
}
