import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React, { useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import type { PaymentDetail } from "../../templates/ExpenseReportTemplate/types";

interface PaymentDetailsSliderProps {
  allDaysData: Array<{
    date: string;
    details: PaymentDetail[];
  }>;
}

const { width: screenWidth } = Dimensions.get("window");
const itemWidth = screenWidth - 40; // 좌우 마진 20씩

export const PaymentDetailsSlider: React.FC<PaymentDetailsSliderProps> = ({
  allDaysData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderPaymentDetail = ({ item }: { item: PaymentDetail }) => (
    <View style={styles.paymentDetailItem}>
      <View style={styles.paymentDetailLeft}>
        <Text style={styles.storeName}>{item.store}</Text>
        <Text style={styles.categoryName}>{item.category}</Text>
      </View>
      <View style={styles.paymentDetailRight}>
        <Text style={styles.paymentAmount}>
          {item.amount.toLocaleString()}원
        </Text>
      </View>
    </View>
  );

  const renderDaySection = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.daySection, { width: itemWidth }]}>
      <Text style={styles.dayTitle}>{item.date}의 결제 내역</Text>
      <View style={styles.paymentDetailsList}>
        {item.details.map((detail: PaymentDetail, detailIndex: number) => (
          <View key={detail.id}>
            {renderPaymentDetail({ item: detail })}
            {detailIndex < item.details.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* 인디케이터 - 여러 날짜가 있을 때만 표시 */}
      {allDaysData.length > 1 && (
        <View style={styles.indicatorContainer}>
          {allDaysData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}

      {/* 슬라이드 컨테이너 */}
      <FlatList
        data={allDaysData}
        renderItem={renderDaySection}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.GRAY_LIGHT,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.BLUE_NORMAL,
  },
  daySection: {
    paddingHorizontal: 16,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    backgroundColor: colors.BLUE_NORMAL,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: "center",
    ...font.bold,
  },
  paymentDetailsList: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
  },
  paymentDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  paymentDetailLeft: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentDetailRight: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: 14,
    color: "#6B7280",
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_LIGHT,
    marginVertical: 8,
  },
});
