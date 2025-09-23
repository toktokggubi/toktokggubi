import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TransactionRowProps } from "./types";
import { CATEGORY_LABELS } from "@/shared/constants/categories";
import { CATEGORY_ICON_BY_NAME } from "@/shared/constants/categoryIcons";
import { colors } from "@/shared/constants/colors";

export const TransactionRow: React.FC<TransactionRowProps> = ({
  merchantName,
  category,
  paymentMethod,
  amount,
  date,
  onPress,
}) => {
  const categoryLabel = CATEGORY_LABELS[category];
  const categoryIcon = CATEGORY_ICON_BY_NAME[categoryLabel];
  
  // 날짜 포맷팅 (MM/DD 형식)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* 중간: 상점명, 카테고리 */}
      <View style={styles.contentContainer}>
        <Text style={styles.merchantName} numberOfLines={1}>
          {merchantName}
        </Text>
        <View style={styles.subInfoContainer}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
      </View>

      {/* 오른쪽: 금액 */}
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          {Math.abs(amount).toLocaleString("ko-KR")}원
        </Text>
        <Text style={styles.paymentMethod}>{paymentMethod}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  subInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 11,
    color: "#999999",
    fontWeight: "500",
  },
});
