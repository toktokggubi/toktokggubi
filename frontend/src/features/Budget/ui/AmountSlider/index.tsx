import Slider from "@react-native-community/slider";
import { View } from "react-native";
import { AmountSliderProps } from "./types";

export default function AmountSlider({
  value,
  onChange,
  min = 100000,
  max = 2000000,
  step = 10000,
}: AmountSliderProps) {
  return (
    <View style={{ width: "100%", paddingHorizontal: 16 }}>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#3B82F6"
        maximumTrackTintColor="#D1D5DB"
        thumbTintColor="#E5E7EB"
      />
    </View>
  );
}
