import React, { useCallback } from "react";
import { router } from "expo-router";
import MolbbangHomeTemplate from "@/features/Lucky/templates/Molbbang/HomeTemplate";
import bgImg from "@/assets/images/illustration/game-start.png";

// ⚠️ 비디오는 import 말고 require 후 { uri: ... } 형태로!
const danceVideoSrc = require("@/assets/video/character-dance.mp4");

export default function MolbbangScreen() {
  const goCreate = useCallback(() => router.push("/molbbang/create"), []);
  const goJoin = useCallback(() => router.push("/molbbang/join"), []);
  return (
    <MolbbangHomeTemplate
      bgImg={bgImg}
      danceVideo={danceVideoSrc}
      onPressCreate={goCreate}
      onPressJoin={goJoin}
    />
  );
}
