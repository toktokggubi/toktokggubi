// src/shared/ui/BottomSheet/types.ts
import type React from "react";
import type BottomSheet from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetProps as GorhomBottomSheetProps,
} from "@gorhom/bottom-sheet";

export type BottomSheetRef = BottomSheet | null;

export interface AppBottomSheetProps
  extends Omit<
    GorhomBottomSheetProps,
    "snapPoints" | "children" | "backdropComponent"
  > {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  enablePanDownToClose?: boolean;
  showBackdrop?: boolean;
  renderBackdropProps?: Partial<BottomSheetBackdropProps>;
  onIndexChange?: (index: number) => void;
  onClosed?: () => void;
}
