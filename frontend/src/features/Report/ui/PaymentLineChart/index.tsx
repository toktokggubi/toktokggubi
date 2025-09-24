// frontend/src/features/Report/ui/PaymentLineChart/index.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Line, Circle, Text as SvgText, Path } from "react-native-svg";
import { PaymentLineChartProps } from "./types";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 40; // 화면에 표시될 너비
const chartHeight = 200;
const padding = 20; // 좌우 패딩

export const PaymentLineChart: React.FC<PaymentLineChartProps> = ({
  data,
  maxCount,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>결제 데이터가 없습니다</Text>
      </View>
    );
  }

  const maxValue = Math.max(maxCount, 5); // 최소 5까지 표시
  const stepX = (chartWidth - padding * 2) / (data.length - 1);
  const stepY = (chartHeight - padding * 2) / maxValue;

  // 좌표 계산 함수
  const getX = (index: number) => padding + index * stepX;
  const getY = (value: number) => chartHeight - padding - value * stepY;

  // 라인 경로 생성
  const pathData = data
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.count);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y축 그리드 라인 */}
          {Array.from({ length: maxValue + 1 }, (_, i) => (
            <Line
              key={i}
              x1={padding}
              y1={getY(i)}
              x2={chartWidth - padding}
              y2={getY(i)}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}

          {/* X축 그리드 라인 (5일 간격으로만 표시) */}
          {data.map((item, index) => {
            const day = parseInt(item.date.split(".")[1]);
            // 5일 간격으로만 그리드 라인 표시
            if (day % 5 === 0 || day === 1 || day === 30) {
              return (
                <Line
                  key={index}
                  x1={getX(index)}
                  y1={padding}
                  x2={getX(index)}
                  y2={chartHeight - padding}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                />
              );
            }
            return null;
          })}

          {/* 라인 차트 */}
          <Path
            d={pathData}
            stroke="#3B82F6"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y축 라벨 */}
          {Array.from({ length: maxValue + 1 }, (_, i) => (
            <SvgText
              key={i}
              x={padding - 10}
              y={getY(i) + 4}
              fontSize="12"
              fill="#6B7280"
              textAnchor="end"
            >
              {i}
            </SvgText>
          ))}

          {/* X축 라벨 (5일 간격으로 표시) */}
          {data.map((item, index) => {
            const day = parseInt(item.date.split(".")[1]);
            // 5일 간격으로만 라벨 표시
            if (day % 5 === 0 || day === 1 || day === 30) {
              return (
                <SvgText
                  key={index}
                  x={getX(index)}
                  y={chartHeight - 5}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {item.date}
                </SvgText>
              );
            }
            return null;
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  noDataText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 40,
  },
});
