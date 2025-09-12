import type { CategoryName } from "@/shared/constants/categoryIcons";

export interface CategoryBudgetItem {
  name: CategoryName;
  amount: number;
}

export interface CategoryBudgetListProps {
  /** 서버가 주는 카테고리별 예산 리스트 */
  items: CategoryBudgetItem[];
  /** 개별 항목 금액 변경 */
  onChangeItem?: (name: CategoryBudgetItem["name"], next: number) => void;
  /** 전체 편집 비활성화 */
  disabled?: boolean;
  /** 아이콘 매퍼 (기본: CATEGORY_ICON_BY_NAME) */
  getIcon?: (name: CategoryName) => any;
  /** 라벨 매퍼 (i18n 등) */
  getLabel?: (name: CategoryName) => string;
  /** 항목 간 간격(px) */
  gap?: number;
}
