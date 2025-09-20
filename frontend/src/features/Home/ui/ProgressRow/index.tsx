import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { ProgressRowProps } from "./types";
import { CATEGORY_LABELS } from "@/shared/constants/categories";
import { CATEGORY_ICON_BY_NAME } from "@/shared/constants/categoryIcons";
import { krw } from "@/shared/utils/currency";
import { colors } from "@/shared/constants/colors";

export const ProgressRow: React.FC<ProgressRowProps> = ({
  type,
  currentAmount,
  totalAmount,
  onPress,
  category,
  showUsageDetails = true,
  isExpanded = false,
  onUsageDetailsPress,
}) => {
  const progressPercentage = Math.min((currentAmount / totalAmount) * 100, 100);
  
  const isTotalType = type === "total";
  const label = isTotalType ? "나의 전체예산" : (category ? CATEGORY_LABELS[category] : "");
  const amountText = `${currentAmount.toLocaleString("ko-KR")}/${totalAmount.toLocaleString("ko-KR")}원`;
  
  // 카테고리 아이콘
  const categoryIcon = !isTotalType && category ? CATEGORY_ICON_BY_NAME[label] : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isTotalType ? styles.totalContainer : styles.categoryContainer,
      ]}
      disabled={!onPress}
    >
      {/* 상단 텍스트 */}
      <View style={styles.textRow}>
        <View style={styles.labelContainer}>
          {categoryIcon && (
            <Image
              source={categoryIcon}
              style={styles.categoryIcon}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.label, isTotalType ? styles.totalLabel : styles.categoryLabel]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.amount, isTotalType ? styles.totalAmount : styles.categoryAmount]}>
          {amountText}
        </Text>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: colors.BLUE_NORMAL,
              },
            ]}
          />
        </View>
      </View>

      {/* 사용내역 링크 (카테고리별만) */}
      {!isTotalType && showUsageDetails && (
        <TouchableOpacity 
          style={styles.usageDetailsContainer}
          onPress={onUsageDetailsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.usageDetailsText}>사용내역</Text>
          <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: "100%",
  },
  totalContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  categoryContainer: {
    marginHorizontal: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalLabel: {
    color: colors.GRAY_DARKER,
  },
  categoryLabel: {
    color: colors.GRAY_DARKER,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    color: colors.GRAY_DARKER,
  },
  categoryAmount: {
    color: colors.GRAY_DARKER,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.BLUE_LIGHT,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  usageDetailsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  usageDetailsText: {
    fontSize: 12,
    color: colors.GRAY_NORMAL,
    marginRight: 4,
  },
  chevron: {
    fontSize: 10,
    color: colors.GRAY_NORMAL,
  },
});
