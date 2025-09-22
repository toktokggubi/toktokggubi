import React, { memo } from "react";
import { Modal, StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";
import type { GifticonImageViewerProps } from "./types";

function GifticonImageViewerImpl({
  visible,
  images,
  index,
  onRequestClose,
}: GifticonImageViewerProps) {
  if (!visible || images.length === 0) return null;

  const currentImage = images[index] || images[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri: currentImage.uri }}
          style={styles.image}
          contentFit="contain"
        />
      </View>
    </Modal>
  );
}

export const GifticonImageViewer = memo(GifticonImageViewerImpl);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: "80%",
  },
});
