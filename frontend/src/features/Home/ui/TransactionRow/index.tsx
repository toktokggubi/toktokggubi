import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TransactionRowProps } from "./types";
import { CATEGORY_LABELS } from "@/shared/constants/categories";
import { formatCurrency } from "@/shared/utils/currency";
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

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
    >
      {/* 텍스트 정보 */}
      <View style={styles.textContainer}>
        <Text style={styles.merchantName}>{merchantName}</Text>
        <Text style={styles.categoryInfo}>
          {categoryLabel} | {paymentMethod}
        </Text>
        {date && <Text style={styles.dateInfo}>{date}</Text>}
      </View>

      {/* 금액 */}
      <Text style={styles.amount}>{Math.abs(amount).toLocaleString("ko-KR")}원</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textContainer: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
    marginBottom: 2,
  },
  categoryInfo: {
    fontSize: 11,
    color: colors.GRAY_NORMAL,
  },
  dateInfo: {
    fontSize: 10,
    color: colors.GRAY_NORMAL,
    marginTop: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
  },
});
