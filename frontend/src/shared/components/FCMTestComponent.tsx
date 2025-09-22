import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FCMService from '@/shared/services/fcmService';
import * as SecureStore from 'expo-secure-store';

/**
 * FCM 테스트용 컴포넌트 (개발 환경에서만 사용)
 * 실제 프로덕션에서는 제거해야 합니다.
 */
export default function FCMTestComponent() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // FCM 토큰 가져오기
    const getToken = async () => {
      try {
        const fcmService = FCMService.getInstance();
        const token = await fcmService.getToken();
        setFcmToken(token);
      } catch (error) {
        console.error('FCM 토큰 가져오기 실패:', error);
      }
    };

    getToken();
  }, []);

  // 토큰을 서버에 전송
  const sendTokenToServer = async () => {
    if (!fcmToken) {
      Alert.alert('오류', 'FCM 토큰이 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const fcmService = FCMService.getInstance();
      const result = await fcmService.sendTokenToServer(fcmToken, accessToken);
      
      if (result.success) {
        Alert.alert('성공', 'FCM 토큰이 서버에 전송되었습니다.');
      } else {
        Alert.alert('실패', result.message || '토큰 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('토큰 전송 실패:', error);
      Alert.alert('오류', '토큰 전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 삭제
  const deleteToken = async () => {
    setIsLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const fcmService = FCMService.getInstance();
      const result = await fcmService.deleteToken(accessToken, true);
      
      if (result.success) {
        Alert.alert('성공', 'FCM 토큰이 삭제되었습니다.');
        setFcmToken(null);
      } else {
        Alert.alert('실패', result.message || '토큰 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
      Alert.alert('오류', '토큰 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 새로고침
  const refreshToken = async () => {
    try {
      const fcmService = FCMService.getInstance();
      const token = await fcmService.getToken();
      setFcmToken(token);
      Alert.alert('성공', 'FCM 토큰이 새로고침되었습니다.');
    } catch (error) {
      console.error('토큰 새로고침 실패:', error);
      Alert.alert('오류', '토큰 새로고침 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FCM 테스트</Text>
      
      <View style={styles.tokenContainer}>
        <Text style={styles.label}>FCM 토큰:</Text>
        <Text style={styles.token} numberOfLines={3}>
          {fcmToken || '토큰을 가져오는 중...'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={refreshToken}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>토큰 새로고침</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.sendButton]}
          onPress={sendTokenToServer}
          disabled={isLoading || !fcmToken}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '전송 중...' : '서버에 전송'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={deleteToken}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '삭제 중...' : '토큰 삭제'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        ⚠️ 이 컴포넌트는 개발 환경에서만 사용하세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  tokenContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  token: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});
