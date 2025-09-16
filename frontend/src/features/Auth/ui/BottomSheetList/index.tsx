import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { AppBottomSheetProps, BottomSheetRef } from "./types";

const AppBottomSheet = forwardRef<BottomSheet, AppBottomSheetProps>(
  function AppBottomSheet(
    {
      children,
      snapPoints = ["30%"],
      initialIndex = -1,
      enablePanDownToClose = true,
      showBackdrop = true,
      renderBackdropProps,
      onIndexChange,
      onClosed,
      style,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => innerRef.current as BottomSheet);

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const handleChange = useCallback(
      (index: number) => {
        onIndexChange?.(index);
        if (index === -1) onClosed?.();
      },
      [onIndexChange, onClosed]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) =>
        showBackdrop ? (
          <BottomSheetBackdrop
            {...props}
            pressBehavior="close"
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            {...renderBackdropProps}
          />
        ) : null,
      [showBackdrop, renderBackdropProps]
    );

    return (
      <BottomSheet
        ref={innerRef}
        index={initialIndex}
        snapPoints={memoizedSnapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        style={[{ zIndex: 10, elevation: 10 }, style]}
        enableDynamicSizing={true}
        onChange={handleChange}
        {...rest}
      >
        <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
      </BottomSheet>
    );
  }
);

export default AppBottomSheet;
export * from "./types";
