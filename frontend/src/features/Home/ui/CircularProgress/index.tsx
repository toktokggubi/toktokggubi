import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/shared/constants/colors";

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
  size = 120,
}) => {
  const progressPercentage = Math.min((currentAmount / totalAmount) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.BLUE_LIGHT}
          strokeWidth={8}
          fill="transparent"
        />
        {/* 진행 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.BLUE_NORMAL}
          strokeWidth={8}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* 중앙 텍스트 */}
      <View style={styles.textContainer}>
        <Text style={styles.monthText}>{month} 예산</Text>
        <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
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
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.GRAY_NORMAL,
    marginBottom: 3,
  },
  percentageText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.BLUE_NORMAL,
    marginBottom: 5,
  },
  usedAmountText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
  },
  totalAmountText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.GRAY_NORMAL,
    marginTop: 2,
  },
});
