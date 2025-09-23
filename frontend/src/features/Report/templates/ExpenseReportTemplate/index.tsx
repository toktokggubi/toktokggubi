// frontend/src/features/Report/templates/ExpenseReportTemplate/index.tsx
import NotificationIcon from "@/shared/components/NotificationIcon";
import { colors } from "@/shared/constants/colors";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnomalyDetectionSection } from "../../ui/AnomalyDetectionSection";
import { ExpenseDonutChart } from "../../ui/ExpenseDonutChart";
import { PaymentLineChart } from "../../ui/PaymentLineChart";
import { ExpenseReportTemplateProps } from "./types";

export const ExpenseReportTemplate: React.FC<ExpenseReportTemplateProps> = ({
  year,
  month,
  totalAmount,
  summaryText,
  chartData,
  categoryData,
  onCategoryPress,
  dailyPaymentData,
  maxPaymentDay,
  maxPaymentDayDetails,
  onMoreDetailsPress,
  vipStores,
  onVIPStorePress,
  anomalyData,
  totalAnomalyAmount,
  onNotificationPress,
  unreadNotificationCount = 0,
}) => {
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 알림 아이콘 */}
        <NotificationIcon
          onPress={onNotificationPress}
          unreadCount={unreadNotificationCount}
        />
        {/* 이상탐지 섹션 */}
        {anomalyData && anomalyData.length > 0 && (
          <>
            <AnomalyDetectionSection
              anomalyData={anomalyData}
              totalAnomalyAmount={totalAnomalyAmount || 0}
            />
            {/* 구분선 */}
            <View style={styles.sectionDivider} />
          </>
        )}

        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {year}년 {monthNames[month - 1]} 지출
            </Text>
            <Text style={styles.totalAmount}>
              {totalAmount.toLocaleString()}원
            </Text>
            <Text
              style={styles.summaryText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {summaryText}
            </Text>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.sectionDivider} />

        {/* 차트 섹션 */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>카테고리별 지출 현황</Text>
          <View style={styles.chartContainer}>
            <ExpenseDonutChart
              data={chartData}
              size={180}
              strokeWidth={30}
              showCenterText={false}
              centerText="8월 지출"
            />
          </View>

          {/* 차트 범례 */}
          <View style={styles.chartLegend}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 카테고리 리스트 섹션 */}
        <View style={styles.listSection}>
          {categoryData.map((item, index) => (
            <View key={index}>
              <View style={styles.categoryItem}>
                <View style={styles.leftContent}>
                  <View
                    style={[styles.colorDot, { backgroundColor: item.color }]}
                  />
                  <View style={styles.labelContainer}>
                    <Text
                      style={styles.categoryLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      ({item.percentage.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
                <Text style={styles.amount}>
                  {item.value.toLocaleString()}원
                </Text>
              </View>
              {index < categoryData.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>

        {/* 구분선 */}
        <View style={styles.sectionDivider} />

        {/* 결제 내역 섹션 */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>일별 결제 현황</Text>

          {/* 결제 통계 */}
          <View style={styles.paymentStats}>
            <Text style={styles.statsText}>
              총{" "}
              <Text style={styles.boldText}>
                {dailyPaymentData.reduce((sum, item) => sum + item.count, 0)}개
              </Text>
              의 결제 내역이 있고, 하루 중 가장 많은 결제 건수는{" "}
              <Text style={styles.boldText}>
                {Math.max(...dailyPaymentData.map((item) => item.count))}개
              </Text>
              입니다.
            </Text>
          </View>

          {/* 라인 차트 */}
          <PaymentLineChart
            data={dailyPaymentData}
            maxCount={Math.max(...dailyPaymentData.map((item) => item.count))}
          />

          {/* 최대 결제일 상세 내역 */}
          <View style={styles.maxPaymentDaySection}>
            <Text style={styles.maxPaymentDayTitle}>
              {maxPaymentDay}의 결제 내역
            </Text>
            <View style={styles.paymentDetailsList}>
              {maxPaymentDayDetails.map((detail, index) => (
                <View key={detail.id}>
                  <View style={styles.paymentDetailItem}>
                    <View style={styles.paymentDetailLeft}>
                      <Text style={styles.storeName}>{detail.store}</Text>
                      <Text style={styles.paymentInfo}>
                        {detail.category} | {detail.paymentMethod}
                      </Text>
                    </View>
                    <Text style={styles.paymentAmount}>
                      -{detail.amount.toLocaleString()}원
                    </Text>
                  </View>
                  {index < maxPaymentDayDetails.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.moreDetailsButton}
              onPress={onMoreDetailsPress}
            >
              <Text style={styles.moreDetailsText}>더보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.sectionDivider} />

        {/* VIP 매장 섹션 */}
        <View style={styles.vipSection}>
          <Text style={styles.sectionTitle}>내가 바로 이곳의 VIP</Text>

          {/* VIP 매장 요약 */}
          <View style={styles.vipSummary}>
            <Text style={styles.vipSummaryText}>
              <Text style={styles.vipStoreName}>{vipStores[0]?.name}</Text>에서
              가장 많은 지출을 했어요
            </Text>
          </View>

          {/* VIP 매장 리스트 */}
          <View style={styles.vipList}>
            {vipStores.map((store, index) => (
              <TouchableOpacity
                key={store.id}
                style={styles.vipItem}
                onPress={() => onVIPStorePress(store.name)}
              >
                <View style={styles.vipRank}>
                  <Text style={styles.vipRankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.vipStoreInfo}>
                  <Text style={styles.vipStoreName}>{store.name}</Text>
                  <Text style={styles.vipStoreAmount}>
                    {store.totalAmount.toLocaleString()}원
                  </Text>
                </View>
                <View style={styles.vipVisitCount}>
                  <Text style={styles.vipVisitCountText}>
                    {store.visitCount}회
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleContainer: {
    minWidth: 0,
    flexShrink: 1,
    flexWrap: "nowrap",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    flexWrap: "nowrap",
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
    flexShrink: 1,
    minWidth: 0,
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 24,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 20,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    flexShrink: 1,
    minWidth: 0,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    marginLeft: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  // 결제 내역 섹션 스타일
  paymentSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  paymentStats: {
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  boldText: {
    fontWeight: "700",
    color: "#111827",
  },
  maxPaymentDaySection: {
    marginTop: 24,
  },
  maxPaymentDayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  paymentDetailsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  paymentInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  moreDetailsButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  moreDetailsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  // VIP 섹션 스타일
  vipSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  vipSummary: {
    marginBottom: 20,
  },
  vipSummaryText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  vipList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  vipRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  vipRankNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  vipStoreInfo: {
    flex: 1,
    marginRight: 12,
  },
  vipStoreName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  vipStoreAmount: {
    fontSize: 14,
    color: "#6B7280",
  },
  vipVisitCount: {
    alignItems: "flex-end",
  },
  vipVisitCountText: {
    fontSize: 14,
    color: "#6B7280",
  },
  // 구분선 스타일
  sectionDivider: {
    height: 8,
    backgroundColor: colors.BLUE_LIGHT,
    marginVertical: 12,
    marginHorizontal: 0,
    borderRadius: 0,
  },
});
