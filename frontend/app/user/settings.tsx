import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;

interface SettingItem {
  id: string;
  label: string;
  value: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // 설정 상태 관리
  const [settings, setSettings] = useState<SettingSection[]>([
    {
      title: "알림",
      items: [
        { id: "budget_notification", label: "예산 알림", value: true },
        { id: "abnormal_spending", label: "소비 이상 탐지", value: false },
        { id: "location_suggestions", label: "위치 기반 제안", value: false },
        { id: "monthly_report", label: "월간 리포트", value: true },
      ],
    },
    {
      title: "쉐이크",
      items: [
        { id: "shake_budget_notification", label: "예산 알림", value: true },
        {
          id: "shake_abnormal_spending",
          label: "소비 이상 탐지",
          value: false,
        },
      ],
    },
    {
      title: "기타",
      items: [
        { id: "other_budget_notification", label: "예산 알림", value: true },
        {
          id: "other_abnormal_spending",
          label: "소비 이상 탐지",
          value: false,
        },
      ],
    },
  ]);

  const toggleSetting = (sectionIndex: number, itemIndex: number) => {
    setSettings((prev) => {
      const newSettings = [...prev];
      newSettings[sectionIndex].items[itemIndex].value =
        !newSettings[sectionIndex].items[itemIndex].value;
      return newSettings;
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "설정",
      headerTitleAlign: "center",
      headerTintColor: TXT,
      headerStyle: { backgroundColor: BG },
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 18, ...font.bold },
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

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {settings.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={item.id}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Switch
                    value={item.value}
                    onValueChange={() => toggleSetting(sectionIndex, itemIndex)}
                    trackColor={{ false: "#E2E8F0", true: colors.BLUE_NORMAL }}
                    thumbColor={item.value ? "#FFFFFF" : "#FFFFFF"}
                    ios_backgroundColor="#E2E8F0"
                  />
                </View>
                {itemIndex < section.items.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.BLUE_DARKER,
    marginBottom: -15,
    ...font.medium,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.GRAY_DARK,
    ...font.medium,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_LIGHT,
    marginLeft: 0,
  },
});
