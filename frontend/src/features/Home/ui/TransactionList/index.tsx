import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { TransactionRow } from "../TransactionRow";
import { TransactionListProps, Transaction } from "./types";

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  emptyMessage = "거래 내역이 없습니다.",
}) => {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionRow
      merchantName={item.merchantName}
      category={item.category}
      paymentMethod={item.paymentMethod}
      amount={item.amount}
      onPress={() => onTransactionPress?.(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
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
