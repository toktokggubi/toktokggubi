import { View, StyleSheet } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { colors } from "@/shared/constants/colors";
import type { AmountSliderProps } from "./types";

export default function AmountSlider({
  value,
  onChange,
  min = 100_000,
  max = 4_000_000,
  step = 50_000,
}: AmountSliderProps) {
  return (
    <View style={s.wrap}>
      <Slider
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={colors.BLUE_NORMAL}
        maximumTrackTintColor={colors.BLUE_LIGHT}
        trackStyle={s.track}
        thumbStyle={s.thumb}
        animateTransitions
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 8 },
  track: {
    height: 20,
    borderRadius: 10,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    // Android shadow
    elevation: 3,
  },
});
