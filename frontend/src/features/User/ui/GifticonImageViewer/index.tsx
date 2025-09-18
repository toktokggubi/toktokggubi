import React, { memo } from "react";
import ImageViewing from "react-native-image-viewing";
import type { GifticonImageViewerProps } from "./types";

function GifticonImageViewerImpl({
  visible,
  images,
  index,
  onRequestClose,
}: GifticonImageViewerProps) {
  return (
    <ImageViewing
      images={images}
      imageIndex={index}
      visible={visible}
      onRequestClose={onRequestClose}
      swipeToCloseEnabled
    />
  );
}

export const GifticonImageViewer = memo(GifticonImageViewerImpl);
