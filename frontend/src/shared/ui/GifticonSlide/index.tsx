// src/shared/ui/GifticonSlide/index.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from "react-native";
import type { GifticonCard } from "./types";
import { Image as ExpoImage } from "expo-image";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  gifticon: GifticonCard;
}
export default function GifticonSlide({ gifticon }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const src = gifticon.imageSource ?? "";
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  return (
    <>
      <View>
        <View style={styles.card}>
          {/* 메인 컨텐츠 */}
          <TouchableOpacity style={styles.content} onPress={openModal} activeOpacity={0.9}>
            <ExpoImage
              source={src}
              style={styles.image}
              contentFit="cover"
              contentPosition="top"
              transition={200}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 확대 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={closeModal}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <ExpoImage
                source={src}
                style={styles.modalImage}
                contentFit="contain"
                contentPosition="center"
                transition={200}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 400,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    backgroundColor: "#f5f5f5",
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});
