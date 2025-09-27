import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { processPayment, type PaymentRequest } from "@/features/Pay/api/fetchers";
import * as SecureStore from "expo-secure-store";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function QRScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 카드 정보
  const cardId = params.cardId as string;
  const cardName = params.cardName as string;
  const last4 = params.last4 as string;

  // QR 코드에서 결제 정보 파싱
  const parseQRData = (data: string): { merchantName: string; amount: number } | null => {
    try {
      // JSON 형태의 QR 코드 데이터 파싱 시도
      const parsed = JSON.parse(data);
      if (parsed.merchantName && parsed.amount) {
        return {
          merchantName: parsed.merchantName,
          amount: Number(parsed.amount)
        };
      }
    } catch (error) {
      console.log("JSON 파싱 실패, 다른 형식으로 시도");
    }

    // JSON이 아닌 경우 다른 형식으로 파싱 시도 (예: "merchantName:amount" 형태)
    const parts = data.split(':');
    if (parts.length >= 2) {
      const merchantName = parts[0];
      const amount = Number(parts[1]);
      if (!isNaN(amount)) {
        return { merchantName, amount };
      }
    }

    return null;
  };

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);
    
    try {
      // QR 코드에서 결제 정보 파싱
      const paymentInfo = parseQRData(data);
      
      if (!paymentInfo) {
        Alert.alert(
          "QR 코드 오류",
          "올바른 결제 QR 코드가 아닙니다.",
          [
            {
              text: "다시 스캔",
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              },
            },
          ]
        );
        return;
      }

      // 토큰 상태 확인
      const accessToken = await SecureStore.getItemAsync("access_token");
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      
      console.log("토큰 상태:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0
      });

      // 결제 API 호출
      const paymentRequest: PaymentRequest = {
        userCardId: Number(cardId),
        merchantId: null,  // QR에서 merchantId를 제공하지 않으므로 null
        merchantName: paymentInfo.merchantName,
        amount: paymentInfo.amount,
      };

      console.log("결제 요청:", paymentRequest);
      
      const response = await processPayment(paymentRequest);
      
      console.log("결제 응답:", response);
      console.log("결제 상태:", response.status, "→", response.status?.toUpperCase());
      
      if (response.status?.toUpperCase() === "APPROVED") {
        Alert.alert(
          "결제 완료",
          `${response.merchantName}에서 ${response.finalAmount.toLocaleString()}원 결제가 완료되었습니다.`,
          [
            {
              text: "확인",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "결제 실패",
          `결제가 거부되었습니다. (상태: ${response.status})`,
          [
            {
              text: "다시 시도",
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              },
            },
            {
              text: "취소",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("결제 처리 오류:", error);
      
      let errorMessage = "결제 처리 중 오류가 발생했습니다.";
      
      if (error?.response?.status === 401) {
        errorMessage = "인증이 필요합니다. 토큰을 확인해주세요.";
      } else if (error?.response?.status === 403) {
        errorMessage = "결제 권한이 없습니다.";
      } else if (error?.response?.status === 400) {
        errorMessage = "잘못된 결제 정보입니다.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.log("에러 상세 정보:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      
      Alert.alert(
        "결제 오류",
        errorMessage,
        [
          {
            text: "다시 시도",
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
          {
            text: "취소",
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
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
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.BLUE_LIGHT} />
                  <Text style={styles.scanText}>결제 처리 중...</Text>
                </View>
              ) : (
                <Text style={styles.scanText}>스캔 완료!</Text>
              )}
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
  processingContainer: {
    alignItems: "center",
    gap: 12,
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
