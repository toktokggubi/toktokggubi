import React, { useCallback, useLayoutEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { useNavigation, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";
import GifticonRegisterTemplate from "@/features/User/templates/GifticonRegisterTemplate";
import { uploadGifticon } from "@/features/User/api/gifticonService";
import { useInvalidateGifticons } from "@/features/User/model/gifticon/queries";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;

export default function GifticonRegisterScreen() {
  const navigation = useNavigation();
  const invalidateGifticons = useInvalidateGifticons();

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "기프티콘 등록",
      headerTitleAlign: "center",
      headerTintColor: TXT,
      headerStyle: { backgroundColor: BG },
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 18, fontWeight: "800" },
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Ionicons name="chevron-back" size={24} color={TXT} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleImagePicked = useCallback((uri: string | null) => {
    setLocalImageUri(uri);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!localImageUri) {
      Alert.alert("안내", "기프티콘 이미지를 먼저 선택해 주세요.");
      return;
    }
    
    try {
      setUploading(true);
      console.log("기프티콘 등록 시작 - OCR 처리 중...");
      await uploadGifticon(localImageUri);
      
      // ✅ 등록 성공 후 캐시 무효화
      invalidateGifticons();
      
      Alert.alert("등록 완료", "기프티콘이 등록되었습니다!");
      router.back();
    } catch (error) {
      console.error("기프티콘 등록 실패:", error);
      console.error("에러 상세:", JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout')) {
        Alert.alert("등록 실패", "OCR 처리 시간이 오래 걸려서 타임아웃되었습니다. 다시 시도해주세요.");
      } else {
        Alert.alert("등록 실패", `등록 중 오류가 발생했습니다.\n에러: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
    }
  }, [localImageUri]);

  return (
    <GifticonRegisterTemplate
      imageUri={localImageUri}
      onPickImage={handleImagePicked}
      loading={uploading}
      onSubmit={handleSubmit}
    />
  );
}
