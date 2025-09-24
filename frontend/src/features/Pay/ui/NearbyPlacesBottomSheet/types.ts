import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import type { KakaoPlace } from "@/shared/types/location.types";
import type { Gifticon } from "@/shared/types/gifticon";

export interface PlaceWithBenefits {
  place: KakaoPlace;
  benefits: Array<{
    franchiseId: number;
    franchiseName: string;
    discountRate: number;
    representativeCategory: {
      categoryId: number;
      categoryName: string;
    };
  }>;
  gifticons: Gifticon[];
}

export interface NearbyPlacesBottomSheetProps {
  ref: React.RefObject<BottomSheetRef>;
  places: PlaceWithBenefits[];
  onPlaceSelect: (place: KakaoPlace) => void;
  isFetching?: boolean;
}
