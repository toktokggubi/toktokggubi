import type { CategoryName } from "@/shared/constants/categoryIcons";

export type CategoryBudgetItem = {
  name: CategoryName;
  amount: number;
};

export interface CategoryBudgetTemplateProps {
  /** 이번 달(혹은 다음 달) 카테고리 배분 가능한 전체 예산 */
  availableNextMonth: number;

  /** 서버에서 받은 카테고리별 초기 예산 리스트 */
  items: CategoryBudgetItem[];

  /** 항목별 금액 변경 콜백 (상위에서 상태 보유) */
  onChangeItem: (name: CategoryName, next: number) => void;

  /** 네비게이션 */
  onPressPrev: () => void;
  onPressNext: () => void;

  /** 카피 문구 (기본값 제공) */
  title?: string;
  subtitle?: string;

  /** 전체 편집 비활성화 */
  disabled?: boolean;

  /** 다음 버튼 비활성화 */
  nextDisabled?: boolean;

  /** 스텝 정보 */
  stepIndex: number;
  stepTotal: number;
}
