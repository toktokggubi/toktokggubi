import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationSettingsService, { 
  NotificationSettings, 
  NotificationTypeSettings 
} from "@/shared/services/notificationSettingsService";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;

interface SettingSection {
  title: string;
  items: NotificationTypeSettings[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const notificationService = NotificationSettingsService.getInstance();

  // 설정 상태 관리
  const [settings, setSettings] = useState<SettingSection[]>([]);
  const [loading, setLoading] = useState(true);

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsByGroup = await notificationService.getSettingsByGroup();
      const currentSettings = await notificationService.loadSettings();
      
      // 각 그룹의 아이템에 현재 설정값 추가
      const sections: SettingSection[] = [
        {
          title: "일반",
          items: settingsByGroup.general.map(item => ({
            ...item,
            currentValue: currentSettings[item.settingKey]
          }))
        },
        {
          title: "기타",
          items: settingsByGroup.other.map(item => ({
            ...item,
            currentValue: currentSettings[item.settingKey]
          }))
        }
      ];
      
      setSettings(sections);
    } catch (error) {
      console.error('설정 로드 실패:', error);
      Alert.alert('오류', '설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (sectionIndex: number, itemIndex: number) => {
    try {
      const item = settings[sectionIndex].items[itemIndex];
      const newValue = !item.currentValue;
      
      const success = await notificationService.updateSetting(item.settingKey, newValue);
      
      if (success) {
        // 설정 업데이트 후 다시 로드
        await loadSettings();
      } else {
        Alert.alert('오류', '설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('설정 변경 실패:', error);
      Alert.alert('오류', '설정 변경 중 오류가 발생했습니다.');
    }
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.description && (
                      <Text style={styles.settingDescription}>{item.description}</Text>
                    )}
                  </View>
                  <Switch
                    value={item.currentValue}
                    onValueChange={() => toggleSetting(sectionIndex, itemIndex)}
                    trackColor={{ false: "#E2E8F0", true: colors.BLUE_NORMAL }}
                    thumbColor={item.currentValue ? "#FFFFFF" : "#FFFFFF"}
                    ios_backgroundColor="#E2E8F0"
                    style={{ marginTop: 2 }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.GRAY_DARK,
    ...font.medium,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.BLUE_DARKER,
    marginBottom: 12,
    ...font.medium,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 18,
    minHeight: 60,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.GRAY_DARK,
    ...font.medium,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.GRAY_DARK,
    ...font.regular,
    lineHeight: 18,
    opacity: 0.8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_LIGHT,
    marginLeft: 0,
  },
});
