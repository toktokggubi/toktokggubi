import { useState } from "react";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { View } from "react-native";
import TotalBudgetTemplate from "~features/Budget/templates/TotalBudgetTemplate";
import { router } from "expo-router";

export default function TotalBudgetInputScreen() {
  const [amount, setAmount] = useState(500_000);

  const goPrev = () => router.back();
  const goNext = () => {
    router.push({
      pathname: "/budget/fixed-expense",
      params: { totalAmount: amount.toString() }
    });
  };

  const handlePanGesture = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const threshold = 50; // 스와이프 최소 거리
      
      if (translationX > threshold) {
        // 오른쪽으로 스와이프 - 이전 페이지
        goPrev();
      } else if (translationX < -threshold) {
        // 왼쪽으로 스와이프 - 다음 페이지
        if (amount > 0) {
          goNext();
        }
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={handlePanGesture}>
      <View style={{ flex: 1 }}>
        <TotalBudgetTemplate
          amount={amount}
          onChangeAmount={setAmount}
          onPressPrev={goPrev}
          onPressNext={goNext}
          nextDisabled={amount <= 0}
        />
      </View>
    </PanGestureHandler>
  );
}
