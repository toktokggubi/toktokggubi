import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FCMService from '@/shared/services/fcmService';

/**
 * FCM 토큰 테스트 컴포넌트
 * 개발 환경에서 FCM 토큰이 제대로 획득되는지 확인
 */
export default function FCMTokenTest() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 앱 시작 시 FCM 토큰 가져오기
    const getToken = async () => {
      try {
        const fcmService = FCMService.getInstance();
        const token = await fcmService.getToken();
        setFcmToken(token);
        console.log('FCM 토큰 획득 성공:', token);
      } catch (error) {
        console.error('FCM 토큰 획득 실패:', error);
        Alert.alert('오류', 'FCM 토큰을 가져올 수 없습니다.');
      }
    };

    getToken();
  }, []);

  // 토큰 새로고침
  const refreshToken = async () => {
    setIsLoading(true);
    try {
      const fcmService = FCMService.getInstance();
      const token = await fcmService.getToken();
      setFcmToken(token);
      Alert.alert('성공', 'FCM 토큰이 새로고침되었습니다.');
    } catch (error) {
      console.error('토큰 새로고침 실패:', error);
      Alert.alert('오류', '토큰 새로고침 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 복사
  const copyToken = () => {
    if (fcmToken) {
      // 클립보드에 복사 (실제 구현에서는 Clipboard API 사용)
      Alert.alert('토큰 복사', '토큰이 복사되었습니다.\n\n' + fcmToken);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FCM 토큰 테스트</Text>
      
      <View style={styles.tokenContainer}>
        <Text style={styles.label}>FCM 토큰:</Text>
        <Text style={styles.token} numberOfLines={5}>
          {fcmToken || '토큰을 가져오는 중...'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={refreshToken}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '새로고침 중...' : '토큰 새로고침'}
          </Text>
        </TouchableOpacity>

        {fcmToken && (
          <TouchableOpacity
            style={[styles.button, styles.copyButton]}
            onPress={copyToken}
          >
            <Text style={styles.buttonText}>토큰 복사</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>테스트 방법:</Text>
        <Text style={styles.instructionText}>
          1. 토큰이 표시되면 복사 버튼을 눌러 토큰을 복사하세요{'\n'}
          2. Firebase Console > Cloud Messaging으로 이동{'\n'}
          3. "새 캠페인" > "단일 기기" 선택{'\n'}
          4. 복사한 토큰을 입력하고 테스트 메시지 발송{'\n'}
          5. 앱에서 알림 수신 확인
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  tokenContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  token: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
  },
  copyButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
