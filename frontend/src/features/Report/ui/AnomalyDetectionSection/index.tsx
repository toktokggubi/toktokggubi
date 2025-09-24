import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AnomalyMap } from "../AnomalyMap";
import { AnomalyData } from "../AnomalyMap/types";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import LocationIcon from "@/assets/icon/location.svg";

interface AnomalyDetectionSectionProps {
  anomalyData: AnomalyData[];
  totalAnomalyAmount: number;
}

export const AnomalyDetectionSection: React.FC<
  AnomalyDetectionSectionProps
> = ({ anomalyData, totalAnomalyAmount }) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData>(
    anomalyData[0]
  );
  const [showAll, setShowAll] = useState(false);

  // 처음 3개만 보여주고, 더보기 클릭 시 전체 표시
  const displayData = showAll ? anomalyData : anomalyData.slice(0, 3);

  const handleAnomalySelect = (anomaly: AnomalyData) => {
    setSelectedAnomaly(anomaly);
  };

  const handleShowMore = () => {
    setShowAll(!showAll);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 이상탐지</Text>
      <Text style={styles.subtitle}>
        이상 소비 총{" "}
        <Text style={styles.boldText}>
          {totalAnomalyAmount.toLocaleString()}
        </Text>
        원을 탐지했어요
      </Text>

      {/* 지도 섹션 */}
      <View style={styles.mapSection}>
        <AnomalyMap selectedAnomaly={selectedAnomaly} />
      </View>

      {/* 이상탐지 내역 리스트 - 세로 나열 */}
      <View style={styles.anomalyListContainer}>
        {displayData.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.anomalyItem,
              selectedAnomaly.id === item.id && styles.selectedAnomalyItem,
            ]}
            onPress={() => handleAnomalySelect(item)}
          >
            <View style={styles.anomalyItemLeft}>
              <Text style={styles.amount}>
                {item.amount.toLocaleString()}원
              </Text>
              <View style={styles.storeNameContainer}>
                <Text style={styles.storeName}>{item.storeName}</Text>
                <LocationIcon
                  width={12}
                  height={12}
                  style={styles.locationIcon}
                />
              </View>
            </View>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        ))}

        {/* 더보기 버튼 */}
        {anomalyData.length > 3 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={handleShowMore}
          >
            <Text style={styles.showMoreText}>
              {showAll ? "접기" : "더보기"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 16,
    ...font.medium,
    color: colors.BLUE_DARK_HOVER,
    lineHeight: 16,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    color: colors.BLUE_DARKER,
    lineHeight: 26,
  },
  boldText: {
    ...font.bold,
    color: colors.BLUE_DARKER,
  },
  anomalyListContainer: {
    marginTop: 16,
  },
  showMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: colors.GRAY_LIGHT_ACTIVE,
    ...font.medium,
    lineHeight: 14,
  },
  anomalyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  selectedAnomalyItem: {
    backgroundColor: colors.BLUE_LIGHT,
  },
  anomalyItemLeft: {
    flex: 1,
  },
  amount: {
    fontSize: 16,
    ...font.bold,
    lineHeight: 22,
    color: colors.BLUE_DARKER,
    marginBottom: 4,
  },
  storeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginLeft: 4,
  },
  storeName: {
    fontSize: 14,
    color: "#6B7280",
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  mapSection: {
    marginTop: 8,
  },
});
