
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressProps {
  currentAmount: number;
  totalAmount: number;
  month?: string;
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  currentAmount,
  totalAmount,
  month = "12월",
  size = 80,
}) => {
  // 안전한 퍼센트 계산 (0으로 나누기 방지)
  const progressPercentage = totalAmount > 0 
    ? Math.min((currentAmount / totalAmount) * 100, 100)
    : 0;
  
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.BLUE_LIGHT}
          strokeWidth={10}
          fill="transparent"
          opacity={0.3}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.BLUE_NORMAL}
          strokeWidth={10}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.monthText}>{month}</Text>
        <Text style={styles.percentageText}>
          {Math.round(progressPercentage)}%
        </Text>
        <Text style={styles.usedAmountText}>
          {currentAmount.toLocaleString("ko-KR")}원
        </Text>
        <Text style={styles.totalAmountText}>
          / {totalAmount.toLocaleString("ko-KR")}원
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: "transparent",
  },
  monthText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.GRAY_NORMAL,
    backgroundColor: "transparent",
    textShadowColor: "transparent",
  },
  percentageText: {
    fontSize: 24,
    lineHeight: 26,
    ...font.bold,
    color: colors.BLUE_NORMAL,
    marginVertical: 1,
    backgroundColor: "transparent",
    textShadowColor: "transparent",
    marginBottom: 5,
  },
  usedAmountText: {
    fontSize: 12,
    lineHeight: 14,
    ...font.medium,
    color: colors.GRAY_DARKER,
    backgroundColor: "transparent",
    textShadowColor: "transparent",
  },
  totalAmountText: {
    fontSize: 12,
    lineHeight: 14,
    ...font.medium,
    color: colors.GRAY_NORMAL,
    backgroundColor: "transparent",
    textShadowColor: "transparent",
  },
});
