// frontend/src/features/Report/ui/ExpenseDonutChart/index.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G, Text as SvgText, Path } from "react-native-svg";
import { ExpenseDonutChartProps } from "./types";

const DEFAULT_SIZE = 200;
const DEFAULT_STROKE_WIDTH = 20;

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({
  data,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  showCenterText = false,
  centerText = "총 지출",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  // 총 값 계산
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativePercentage = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* 배경 원 */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* 데이터 세그먼트들 */}
        <G>
          {data.map((item, index) => {
            const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference / 100;
            
            cumulativePercentage += percentage;
            
            return (
              <Circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt" // 둥근 끝을 제거하여 네모진 형태
              />
            );
          })}
        </G>

        {/* 중앙 텍스트 (옵션) */}
        {showCenterText && (
          <G>
            <SvgText
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="#6B7280"
            >
              {centerText}
            </SvgText>
            <SvgText
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              fontSize="12"
              fill="#9CA3AF"
            >
              {totalValue.toLocaleString()}원
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
