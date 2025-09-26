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
        <Text style={styles.paymentInfo}>{item.category}</Text>
      </View>
      <Text style={styles.paymentAmount}>
        {item.amount.toLocaleString()}원
      </Text>
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
    paddingHorizontal: 20,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
    marginBottom: 12,
    ...font.bold,
  },
  paymentDetailsList: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
  },
  paymentDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  paymentDetailLeft: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.GRAY_DARKER,
    marginBottom: 2,
    ...font.medium,
  },
  paymentInfo: {
    fontSize: 12,
    color: colors.GRAY_NORMAL,
    ...font.regular,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
    ...font.bold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_LIGHT,
    marginVertical: 8,
  },
});
