import type { ImageSourcePropType } from "react-native";
import type { CategoryName } from "@/shared/constants/categoryIcons";

export interface CategoryItem {
  key: CategoryName;
  label: string;
  icon: ImageSourcePropType;
  disabled?: boolean;
}

export interface CategoryGridProps {
  items: CategoryItem[];
  selectedKeys: CategoryName[];
  onToggle: (key: CategoryName) => void;
  numColumns?: number;
  gap?: number;
}
