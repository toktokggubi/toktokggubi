import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function QRScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // 카드 정보
  const cardId = params.cardId as string;
  const cardName = params.cardName as string;
  const last4 = params.last4 as string;

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // QR 코드 스캔 성공 시 처리
    Alert.alert(
      "QR 코드 스캔 완료",
      `스캔된 데이터: ${data}`,
      [
        {
          text: "확인",
          onPress: () => {
            // 백엔드로 데이터 전송 (실제 구현 필요)
            console.log("카드 정보:", { cardId, cardName, last4 });
            console.log("QR 데이터:", data);
            
            // 결제 완료 후 이전 화면으로 돌아가기
            router.back();
          },
        },
        {
          text: "다시 스캔",
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>카메라 권한을 요청 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            카메라 권한이 필요합니다.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>권한 요청</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.BACKGROUND_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR 코드 스캔</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 카드 정보 표시 */}
      <View style={styles.cardInfoContainer}>
        <Text style={styles.cardName}>{cardName}</Text>
        <Text style={styles.cardNumber}>**** **** **** {last4}</Text>
      </View>

      {/* 카메라 영역 */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
        >
          {/* QR 스캔 프레임 */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          {/* 스캔 상태 표시 */}
          {scanned && (
            <View style={styles.scanOverlay}>
              <Text style={styles.scanText}>스캔 완료!</Text>
            </View>
          )}
        </CameraView>
      </View>

      {/* 하단 안내 */}
      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>
          QR 코드를 프레임 안에 맞춰주세요
        </Text>
        <Text style={styles.bottomSubText}>
          자동으로 인식됩니다
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.GRAY_DARKER,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionText: {
    color: colors.BACKGROUND_PRIMARY,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.BLUE_LIGHT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.GRAY_DARKER,
    fontSize: 16,
    ...font.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.GRAY_DARKER,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: colors.BACKGROUND_PRIMARY,
    fontSize: 18,
    ...font.bold,
  },
  placeholder: {
    width: 40,
  },
  cardInfoContainer: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: colors.GRAY_DARKER,
  },
  cardName: {
    color: colors.BACKGROUND_PRIMARY,
    fontSize: 18,
    ...font.bold,
    marginBottom: 4,
  },
  cardNumber: {
    color: colors.GRAY_NORMAL,
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  scanOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scanText: {
    color: colors.BACKGROUND_PRIMARY,
    fontSize: 16,
    ...font.bold,
    textAlign: "center",
  },
  scanFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: SCREEN_W * 0.6,
    height: SCREEN_W * 0.6,
    transform: [{ translateX: -SCREEN_W * 0.3 }, { translateY: -SCREEN_W * 0.3 }],
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.BLUE_LIGHT,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.GRAY_DARKER,
  },
  bottomText: {
    color: colors.BACKGROUND_PRIMARY,
    fontSize: 16,
    ...font.medium,
    textAlign: "center",
    marginBottom: 4,
  },
  bottomSubText: {
    color: colors.GRAY_NORMAL,
    fontSize: 14,
    textAlign: "center",
  },
});
