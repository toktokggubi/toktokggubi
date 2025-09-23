import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AnomalyMap } from '../AnomalyMap';
import { AnomalyData } from '../AnomalyMap/types';
import { colors } from '@/shared/constants/colors';
import LocationIcon from '@/assets/icon/location.svg';

interface AnomalyDetectionSectionProps {
  anomalyData: AnomalyData[];
  totalAnomalyAmount: number;
}

export const AnomalyDetectionSection: React.FC<AnomalyDetectionSectionProps> = ({
  anomalyData,
  totalAnomalyAmount,
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData>(anomalyData[0]);
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
        이상 소비 총 {totalAnomalyAmount.toLocaleString()}원을 탐지했어요
      </Text>

      {/* 지도 섹션 */}
      <View style={styles.mapSection}>
        <AnomalyMap
          selectedAnomaly={selectedAnomaly}
        />
      </View>

      {/* 이상탐지 내역 리스트 - 세로 나열 */}
      <View style={styles.anomalyListContainer}>
        {displayData.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={[
              styles.anomalyItem,
              selectedAnomaly.id === item.id && styles.selectedAnomalyItem
            ]}
            onPress={() => handleAnomalySelect(item)}
          >
            <View style={styles.anomalyItemLeft}>
              <Text style={styles.amount}>{item.amount.toLocaleString()}원</Text>
              <View style={styles.storeNameContainer}>
                <Text style={styles.storeName}>{item.storeName}</Text>
                <LocationIcon width={12} height={12} style={styles.locationIcon} />
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
              {showAll ? '접기' : '더보기'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  anomalyListContainer: {
    marginTop: 16,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  anomalyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedAnomalyItem: {
    backgroundColor: '#FEF2F2',
  },
  anomalyItemLeft: {
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  storeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginLeft: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  mapSection: {
    marginTop: 8,
  },
});
