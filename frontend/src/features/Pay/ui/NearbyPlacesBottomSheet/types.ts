import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import type { KakaoPlace } from "@/shared/types/location.types";

export interface NearbyPlacesBottomSheetProps {
  ref: React.RefObject<BottomSheetRef>;
  places: KakaoPlace[];
  onPlaceSelect: (place: KakaoPlace) => void;
  isFetching?: boolean;
}
