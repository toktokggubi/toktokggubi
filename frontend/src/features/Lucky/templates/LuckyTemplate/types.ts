import type {
  Category,
  Merchant,
  SaleEvent,
} from "@/features/Lucky/model/types";
import type { SaleEventListItem } from "@/features/Lucky/ui/SaleEventList/types";
import type { ImageSourcePropType } from "react-native";

export interface LuckyTemplateProps {
  year: number;
  month: number;
  category: Category;
  selectedDay: number | null;
  onChangeCategory: (c: Category) => void;
  onSelectDay: (day: number | null) => void;
  onChangeMonth?: (year: number, month: number) => void;

  // 달력에 내려보낼 원자료
  events: SaleEvent[];
  merchants: Merchant[];

  // 선택한 날짜의 상세 리스트
  eventsForDay: SaleEventListItem[];

  // 빵빵 카드(있으면 렌더)
  onPressNbbang?: () => void;
  onPressMolbbang?: () => void;
  nImageSource: ImageSourcePropType;
  molImageSource: ImageSourcePropType;
}
