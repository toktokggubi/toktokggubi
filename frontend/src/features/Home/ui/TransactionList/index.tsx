import { colors } from "@/shared/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TransactionRow } from "../TransactionRow";
import { Transaction, TransactionListProps } from "./types";

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  emptyMessage = "거래 내역이 없습니다.",
}) => {
  // 날짜별로 거래 내역 그룹화
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      if (transaction.date) {
        const date = new Date(transaction.date);
        const dateKey = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "short",
        });

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(transaction);
      } else {
        // 날짜가 없는 경우 "기타" 그룹에 추가
        if (!grouped["기타"]) {
          grouped["기타"] = [];
        }
        grouped["기타"].push(transaction);
      }
    });

    return grouped;
  };

  const formatDateHeader = (dateString: string) => {
    if (dateString === "기타") return "기타";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "오늘";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "어제";
    } else {
      return dateString;
    }
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const groupedTransactions = groupTransactionsByDate(transactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    if (a === "기타") return 1;
    if (b === "기타") return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <View style={styles.container}>
      {sortedDates.map((dateKey) => (
        <View key={dateKey} style={styles.dateGroup}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              {formatDateHeader(dateKey)}
            </Text>
          </View>

          <View style={styles.transactionsContainer}>
            {groupedTransactions[dateKey].map((transaction, index) => (
              <TransactionRow
                key={transaction.id}
                merchantName={transaction.merchantName}
                category={transaction.category}
                paymentMethod={transaction.paymentMethod}
                amount={transaction.amount}
                date={transaction.date}
                onPress={() => onTransactionPress?.(transaction)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateGroup: {
    marginBottom: 8,
  },
  dateHeader: {
    backgroundColor: colors.BLUE_NORMAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  dateHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  transactionsContainer: {
    backgroundColor: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
  },
});
