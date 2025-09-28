import * as SecureStore from 'expo-secure-store';

// 백엔드의 UserNotificationSetting과 일치하는 타입
export interface NotificationSettings {
  allNotificationsOn: boolean;
  budgetThresholdOn: boolean;
  anomalyDetectionOn: boolean;
  locationBasedOn: boolean;
  monthlyReportOn: boolean;
  shakeTriggerOn: boolean;
}

// 알림 타입별 설정 매핑
export interface NotificationTypeSettings {
  id: string;
  label: string;
  settingKey: keyof NotificationSettings;
  description?: string;
  currentValue?: boolean; // UI에서 사용할 현재 값
}

// 알림 타입 정의
export const NOTIFICATION_TYPES: NotificationTypeSettings[] = [
  {
    id: 'all_notifications',
    label: '전체 알림',
    settingKey: 'allNotificationsOn',
    description: '모든 알림을 한번에 켜거나 끌 수 있습니다'
  },
  {
    id: 'budget_threshold',
    label: '예산 임계점 알림',
    settingKey: 'budgetThresholdOn',
    description: '예산 사용량이 80%에 도달하거나 초과했을 때 알림을 받습니다 (전체/카테고리 모두 포함)'
  },
  {
    id: 'anomaly_detection',
    label: '이상 소비 탐지',
    settingKey: 'anomalyDetectionOn',
    description: '평소와 다른 소비를 했을 때 알림을 받습니다'
  },
  {
    id: 'location_based',
    label: '위치 기반 알림',
    settingKey: 'locationBasedOn',
    description: '특정 장소 방문 시 예산 정보를 알림으로 받습니다'
  },
  {
    id: 'monthly_report',
    label: '월간 리포트',
    settingKey: 'monthlyReportOn',
    description: '월간 리포트를 알림으로 받습니다'
  },
  {
    id: 'shake_trigger',
    label: '쉐이크 트리거',
    settingKey: 'shakeTriggerOn',
    description: '기기를 흔들었을 때 해당 장소 결제 정보 페이지로 이동하는 기능을 활성화합니다'
  }
];

const STORAGE_KEY = 'notification_settings';

class NotificationSettingsService {
  private static instance: NotificationSettingsService;

  public static getInstance(): NotificationSettingsService {
    if (!NotificationSettingsService.instance) {
      NotificationSettingsService.instance = new NotificationSettingsService();
    }
    return NotificationSettingsService.instance;
  }

  /**
   * 기본 알림 설정 반환
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      allNotificationsOn: true,
      budgetThresholdOn: true,
      anomalyDetectionOn: true,
      locationBasedOn: true,
      monthlyReportOn: true,
      shakeTriggerOn: true,
    };
  }

  /**
   * 알림 설정 로드
   */
  async loadSettings(): Promise<NotificationSettings> {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationSettings;
        // 기본값과 병합하여 누락된 설정이 있으면 기본값으로 채움
        return { ...this.getDefaultSettings(), ...parsed };
      }
      return this.getDefaultSettings();
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  /**
   * 알림 설정 저장
   */
  async saveSettings(settings: NotificationSettings): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 특정 알림 타입 설정 업데이트
   */
  async updateSetting(settingKey: keyof NotificationSettings, value: boolean): Promise<boolean> {
    try {
      const currentSettings = await this.loadSettings();
      const newSettings = { ...currentSettings, [settingKey]: value };
      
      // 전체 알림이 켜지면 모든 개별 알림도 켜짐 (쉐이크 트리거 제외)
      if (settingKey === 'allNotificationsOn' && value) {
        newSettings.budgetThresholdOn = true;
        newSettings.anomalyDetectionOn = true;
        newSettings.locationBasedOn = true;
        newSettings.monthlyReportOn = true;
        // shakeTriggerOn은 전체 알림에 영향받지 않음
      }
      
      // 전체 알림이 꺼지면 모든 개별 알림도 꺼짐 (쉐이크 트리거 제외)
      if (settingKey === 'allNotificationsOn' && !value) {
        newSettings.budgetThresholdOn = false;
        newSettings.anomalyDetectionOn = false;
        newSettings.locationBasedOn = false;
        newSettings.monthlyReportOn = false;
        // shakeTriggerOn은 전체 알림에 영향받지 않음
      }
      
      // 개별 알림이 켜지면 전체 알림도 켜짐 (쉐이크 트리거 제외)
      if (settingKey !== 'allNotificationsOn' && settingKey !== 'shakeTriggerOn' && value) {
        newSettings.allNotificationsOn = true;
      }
      
      return await this.saveSettings(newSettings);
    } catch (error) {
      return false;
    }
  }

  /**
   * 특정 알림 타입이 활성화되어 있는지 확인
   */
  async isNotificationEnabled(settingKey: keyof NotificationSettings): Promise<boolean> {
    try {
      const settings = await this.loadSettings();
      return settings[settingKey];
    } catch (error) {
      return false;
    }
  }

  /**
   * 알림 설정 초기화
   */
  async resetSettings(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 알림이 허용되어야 하는지 확인 (실제 알림 발송 전 체크용)
   */
  async shouldSendNotification(notificationType: string): Promise<boolean> {
    try {
      const settings = await this.loadSettings();
      
      // 쉐이크 트리거는 전체 알림 설정에 영향받지 않음
      if (notificationType === 'SHAKE_TRIGGER') {
        return settings.shakeTriggerOn;
      }
      
      // 전체 알림이 꺼져있으면 모든 알림 차단 (쉐이크 트리거 제외)
      if (!settings.allNotificationsOn) {
        return false;
      }

      // 알림 타입별 설정 확인
      switch (notificationType) {
        case 'THRESHOLD/TOTAL':
        case 'THRESHOLD/CATEGORY':
        case 'EXCEEDED/TOTAL':
        case 'EXCEEDED/CATEGORY':
          return settings.budgetThresholdOn;
        case 'ANOMALY_DETECTION':
          return settings.anomalyDetectionOn;
        case 'LOCATION_BASED':
          return settings.locationBasedOn;
        case 'MONTHLY_REPORT':
          return settings.monthlyReportOn;
        default:
          return settings.allNotificationsOn;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 설정을 그룹별로 분류하여 반환
   */
  async getSettingsByGroup(): Promise<{
    general: NotificationTypeSettings[];
    other: NotificationTypeSettings[];
  }> {
    const general = NOTIFICATION_TYPES.filter(type => 
      ['all_notifications', 'budget_threshold', 'anomaly_detection', 'location_based', 'monthly_report'].includes(type.id)
    );
    
    const other = NOTIFICATION_TYPES.filter(type => 
      type.id === 'shake_trigger'
    );

    return { general, other };
  }
}

export default NotificationSettingsService;
