import React, { useCallback, useLayoutEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { useNavigation, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";
import GifticonRegisterTemplate from "@/features/User/templates/GifticonRegisterTemplate";
import {
  uploadGifticonFile,
  requestGifticonPreview,
  createGifticon,
} from "@/features/User/api/gifticonService";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;

export default function GifticonRegisterScreen() {
  const navigation = useNavigation();

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [merchant, setMerchant] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleImagePicked = useCallback(async (uri: string | null) => {
    setLocalImageUri(uri);
    setImageUrl(null);
    setMerchant("");
    setLabel("");
    setExpiresAt("");
    if (!uri) return;
    try {
      setLoadingPreview(true);
      const { imageUrl } = await uploadGifticonFile(uri);
      setImageUrl(imageUrl);
      const preview = await requestGifticonPreview({ imageUrl });
      setMerchant(preview.merchant ?? "");
      setLabel(preview.label ?? "");
      setExpiresAt(preview.expiresAt ?? "");
    } catch {
      Alert.alert(
        "오류",
        "이미지 분석에 실패했습니다. 값을 직접 입력해 주세요."
      );
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!imageUrl)
      return Alert.alert("안내", "기프티콘 이미지를 먼저 업로드해 주세요.");
    try {
      setSaving(true);
      await createGifticon({ imageUrl, merchant, label, expiresAt });
      Alert.alert("등록 완료", "기프티콘 저장 완료");
      router.back();
    } catch {
      Alert.alert("실패", "등록 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }, [imageUrl, merchant, label, expiresAt]);

  return (
    <GifticonRegisterTemplate
      imageUri={localImageUri}
      onPickImage={handleImagePicked}
      loadingPreview={loadingPreview}
      merchant={merchant}
      onMerchantChange={setMerchant}
      label={label}
      onLabelChange={setLabel}
      expiresAt={expiresAt}
      onExpiresAtChange={setExpiresAt}
      onSubmit={handleSubmit}
      saving={saving}
    />
  );
}
