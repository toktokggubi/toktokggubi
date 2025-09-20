import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TransactionRow } from "../TransactionRow";
import { TransactionListProps, Transaction } from "./types";

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  emptyMessage = "거래 내역이 없습니다.",
}) => {
  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContent}>
        {transactions.map((item, index) => (
          <View key={item.id}>
            <TransactionRow
              merchantName={item.merchantName}
              category={item.category}
              paymentMethod={item.paymentMethod}
              amount={item.amount}
              date={item.date}
              onPress={() => onTransactionPress?.(item)}
            />
            {index < transactions.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: "100%",
  },
  listContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  separator: {
    height: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
  },
});
