import type { CategoryName } from "@/shared/constants/categoryIcons";
import type { CategoryItem } from "~features/Budget/ui/molecules/CategoryGrid/types";

export interface SelectCategoryTemplateProps {
  title: string;
  subtitle?: string;

  items: CategoryItem[];
  selectedKeys: CategoryName[];
  onToggle: (key: CategoryName) => void;

  stepIndex: number;
  stepTotal: number;
  onPressPrev?: () => void;
  onPressNext: () => void;
  nextDisabled?: boolean;
}
