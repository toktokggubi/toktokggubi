// frontend/src/features/Report/ui/AnomalyMap/index.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AnomalyData } from './types';

interface AnomalyMapProps {
  selectedAnomaly: AnomalyData;
}

const { width, height } = Dimensions.get('window');

export const AnomalyMap: React.FC<AnomalyMapProps> = ({
  selectedAnomaly,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // 선택된 데이터가 바뀌면 해당 위치로 카메라 이동
    const timeout = setTimeout(() => {
      mapRef.current?.animateCamera(
        { 
          center: { latitude: selectedAnomaly.latitude, longitude: selectedAnomaly.longitude }, 
          zoom: 18 // 17~19 사이로 조절 (18은 건물/거리 급)
        }, 
        { duration: 400 }
      );
    }, 100);
    return () => clearTimeout(timeout);
  }, [selectedAnomaly.latitude, selectedAnomaly.longitude]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialCamera={{
          center: { latitude: selectedAnomaly.latitude, longitude: selectedAnomaly.longitude },
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
            latitude: selectedAnomaly.latitude,
            longitude: selectedAnomaly.longitude,
          }}
          title={selectedAnomaly.storeName}
          description={`${selectedAnomaly.amount.toLocaleString()}원 ${selectedAnomaly.date}`}
          pinColor="#EF4444" // 빨간색 마커
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
});
