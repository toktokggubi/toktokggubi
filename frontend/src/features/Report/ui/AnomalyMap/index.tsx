// frontend/src/features/Report/ui/AnomalyMap/index.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AnomalyData } from './types';
import { geocodeStoreName, refineStoreNameForSearch } from '@/shared/services/geocodingService';

interface AnomalyMapProps {
  selectedAnomaly: AnomalyData;
}

const { width, height } = Dimensions.get('window');

export const AnomalyMap: React.FC<AnomalyMapProps> = ({
  selectedAnomaly,
}) => {
  const mapRef = useRef<MapView>(null);
  const [geocodedLocation, setGeocodedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    placeName?: string;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // 지오코딩 함수
  const performGeocoding = useCallback(async () => {
    // 이미 좌표가 있는 경우 (0,0이 아닌 경우) 지오코딩 생략
    if (selectedAnomaly.latitude !== 0 && selectedAnomaly.longitude !== 0) {
      setGeocodedLocation({
        latitude: selectedAnomaly.latitude,
        longitude: selectedAnomaly.longitude,
        placeName: selectedAnomaly.storeName,
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const refinedStoreName = refineStoreNameForSearch(selectedAnomaly.storeName);
      const result = await geocodeStoreName(refinedStoreName);
      
      setGeocodedLocation(result);
    } catch (error) {
      // 실패 시 기본 좌표 사용
      setGeocodedLocation({
        latitude: 36.3508, // 삼성화재 유성연수원
        longitude: 127.2985,
        placeName: selectedAnomaly.storeName,
      });
    } finally {
      setIsGeocoding(false);
    }
  }, [selectedAnomaly.storeName, selectedAnomaly.latitude, selectedAnomaly.longitude]);

  // 컴포넌트 마운트 시 지오코딩 수행
  useEffect(() => {
    performGeocoding();
  }, [performGeocoding]);

  // 지오코딩된 위치가 변경되면 카메라 이동
  useEffect(() => {
    if (geocodedLocation) {
      const timeout = setTimeout(() => {
        mapRef.current?.animateCamera(
          { 
            center: { 
              latitude: geocodedLocation.latitude, 
              longitude: geocodedLocation.longitude 
            }, 
            zoom: 18 // 17~19 사이로 조절 (18은 건물/거리 급)
          }, 
          { duration: 400 }
        );
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [geocodedLocation]);

  // 마커 클릭 핸들러
  const handleMarkerPress = useCallback(() => {
    if (geocodedLocation) {
      Alert.alert(
        geocodedLocation.placeName || selectedAnomaly.storeName,
        `금액: ${selectedAnomaly.amount.toLocaleString()}원\n날짜: ${selectedAnomaly.date}\n카테고리: ${selectedAnomaly.category}\n결제수단: ${selectedAnomaly.paymentMethod}${geocodedLocation.address ? `\n주소: ${geocodedLocation.address}` : ''}`,
        [{ text: '확인' }]
      );
    }
  }, [geocodedLocation, selectedAnomaly]);

  // 지오코딩 중이거나 위치 정보가 없는 경우
  if (isGeocoding || !geocodedLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingOverlay}>
          {/* 로딩 인디케이터는 필요에 따라 추가 */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialCamera={{
          center: { 
            latitude: geocodedLocation.latitude, 
            longitude: geocodedLocation.longitude 
          },
          zoom: 16,           // 초기 줌
          heading: 0,
          pitch: 0,
          altitude: 0,
        }}
        minZoomLevel={14}     // 최소/최대 줌 제한
        maxZoomLevel={20}
        mapType="standard"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
      >
        <Marker
          coordinate={{
            latitude: geocodedLocation.latitude,
            longitude: geocodedLocation.longitude,
          }}
          title={geocodedLocation.placeName || selectedAnomaly.storeName}
          description={`${selectedAnomaly.amount.toLocaleString()}원 ${selectedAnomaly.date}`}
          pinColor="#EF4444" // 빨간색 마커
          onPress={handleMarkerPress}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
