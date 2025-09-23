import { View } from "react-native";
import { StepDotsProps } from "./types";

export default function StepDots({ index, total }: StepDotsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === index ? "#3B82F6" : "#D1D5DB",
          }}
        />
      ))}
    </View>
  );
}
