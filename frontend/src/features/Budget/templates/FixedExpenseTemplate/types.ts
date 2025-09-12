import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";
import type {
  FixedExpenseFormMode,
  AddFixedExpenseFormValues,
} from "~features/Budget/ui/forms/AddFixedExpenseForm/types";

export interface FixedExpenseTemplateProps {
  // 상단 카피
  title?: string;
  subtitle?: string;

  // 리스트
  items: FixedExpenseItem[];
  onPressItem?: (item: FixedExpenseItem) => void;
  onPressAdd?: () => void;

  // 우측(옆) 모달 폼
  formVisible: boolean;
  formMode?: FixedExpenseFormMode; // "create" | "edit"
  formDefaultValues?: Partial<AddFixedExpenseFormValues>;
  onSubmitForm: (v: AddFixedExpenseFormValues) => void;
  onCancelForm?: () => void;

  // 안내 텍스트 (다음 달 사용 가능 예산)
  availableNextMonth: number;

  // 푸터(네비)
  stepIndex: number;
  stepTotal: number;
  onPressPrev?: () => void;
  onPressNext: () => void;
  nextDisabled?: boolean;
}
