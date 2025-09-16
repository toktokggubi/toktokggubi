import { Category } from "@/shared/constants/categories";

export interface ProgressRowProps {
  // 전체 예산용 (첫 번째 사진)
  type: "total" | "category";
  
  // 공통 props
  currentAmount: number;
  totalAmount: number;
  onPress?: () => void;
  
  // 카테고리별용 props (두 번째 사진)
  category?: Category;
  showUsageDetails?: boolean;
  isExpanded?: boolean;
  onUsageDetailsPress?: () => void;
}
