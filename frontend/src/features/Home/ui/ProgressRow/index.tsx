import { CATEGORY_LABELS } from "@/shared/constants/categories";
import { CATEGORY_ICON_BY_NAME } from "@/shared/constants/categoryIcons";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProgressRowProps } from "./types";

export const ProgressRow: React.FC<ProgressRowProps> = ({
  type,
  currentAmount,
  totalAmount,
  onPress,
  category,
  showUsageDetails = true,
  isExpanded = false,
  onUsageDetailsPress,
  onEditPress,
}) => {
  // 안전한 퍼센트 계산 (0으로 나누기 방지)
  const progressPercentage = totalAmount > 0 
    ? Math.min((currentAmount / totalAmount) * 100, 100)
    : 0;
  const remainingAmount = totalAmount - currentAmount;
  const isOverBudget = currentAmount > totalAmount || (totalAmount === 0 && currentAmount > 0);

  const isTotalType = type === "total";
  const label = isTotalType
    ? "나의 전체예산"
    : category
    ? CATEGORY_LABELS[category]
    : "";

  // 카테고리 아이콘
  const categoryIcon =
    !isTotalType && category ? CATEGORY_ICON_BY_NAME[label] : null;

  // 80% 미만: 파란색, 80% 이상 100% 미만: 노란색, 100% 이상: 빨간색
  const progressBarColor =
    totalAmount === 0 && currentAmount > 0
      ? "#FF4444"  // 예산 0원 + 지출 있음 = 빨간색
      : progressPercentage >= 100
      ? "#FF4444"  // 100% 이상 = 빨간색
      : progressPercentage >= 80
      ? colors.YELLOW_NORMAL  // 80% 이상 100% 미만 = 노란색
      : colors.BLUE_NORMAL;   // 80% 미만 = 파란색

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isTotalType ? styles.totalContainer : styles.categoryContainer,
      ]}
      disabled={!onPress}
    >
      {/* 상단 텍스트 - 카테고리명 + 사용률, 남은 금액 + 화살표 */}
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          {categoryIcon && (
            <Image
              source={categoryIcon}
              style={styles.categoryIcon}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.label,
              isTotalType ? styles.totalLabel : styles.categoryLabel,
            ]}
          >
            {label}
          </Text>
          <Text style={styles.percentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={[
            styles.remainingAmount,
            isOverBudget && styles.overBudgetText
          ]}>
            {isOverBudget 
              ? `${Math.abs(remainingAmount).toLocaleString("ko-KR")}원 초과`
              : `${remainingAmount.toLocaleString("ko-KR")}원 남음`
            }
          </Text>
          {isTotalType && onEditPress && (
            <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: progressBarColor,
              },
            ]}
          />
        </View>
      </View>

      {/* 하단 텍스트 - 지출 금액 + 예산 금액 */}
      <View style={styles.bottomRow}>
        <Text style={styles.spentAmount}>
          {currentAmount.toLocaleString("ko-KR")}원 지출
        </Text>
        <Text style={styles.budgetAmount}>
          예산 {totalAmount.toLocaleString("ko-KR")}원
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF", // 화이트 배경
    paddingHorizontal: 12,
    paddingVertical: 16,
    width: "100%",
    borderRadius: 12,
  },
  totalContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  categoryContainer: {
    marginHorizontal: 4,
    marginVertical: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    lineHeight: 18,
    ...font.medium,
    color: colors.BLUE_DARKER,
    marginRight: 8,
  },
  totalLabel: {
    color: colors.BLUE_DARKER,
  },
  categoryLabel: {
    color: colors.BLUE_DARKER,
  },
  percentage: {
    fontSize: 14,
    lineHeight: 16,
    ...font.medium,
    color: "#999999", // 라이트 그레이 텍스트
  },
  remainingAmount: {
    fontSize: 14,
    lineHeight: 16,
    ...font.medium,
    color: colors.BLUE_DARKER,
  },
  overBudgetText: {
    color: "#000000", // 검정색으로 표시
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E5E5", // 라이트 그레이 배경
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spentAmount: {
    fontSize: 14,
    lineHeight: 16,
    ...font.medium,
    color: colors.BLUE_DARKER,
  },
  budgetAmount: {
    fontSize: 14,
    lineHeight: 16,
    ...font.medium,
    color: "#999999", // 라이트 그레이 텍스트
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
  },
  editButtonText: {
    fontSize: 16,
  },
});
