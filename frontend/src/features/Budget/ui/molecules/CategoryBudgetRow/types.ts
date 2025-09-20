import type { ImageSourcePropType } from "react-native";
import type { CategoryName } from "@/shared/constants/categoryIcons";

export interface CategoryBudgetRowProps {
  /** 카테고리 키 (중복 불가) */
  name: CategoryName;
  /** 표시 라벨 (기본: name) */
  label?: string;
  /** 아이콘 (CATEGORY_ICON_BY_NAME[name] 권장) */
  icon: ImageSourcePropType;
  /** 금액(원) – 제어 컴포넌트 */
  amount: number;
  /** 금액 변경 콜백 */
  onChangeAmount?: (next: number) => void;
  /** 비활성화(편집 불가) */
  disabled?: boolean;
  /** 테스트ID */
  testID?: string;
}
