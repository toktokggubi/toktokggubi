// app/molbbang/room/[code].tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Alert, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MolbbangRoomTemplate from "@/features/Lucky/templates/MolbbangRoomTemplate";
import { useShake } from "@/features/Lucky/model/molbbang/useShake";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";

const idlePng = require("@/assets/images/character/big-character-02.png");
const shakePng = require("@/assets/images/character/big-character-05.png");

export default function MolbbangRoomScreen() {
  const router = useRouter();
  // 1) 파라미터 안전 변환
  const raw = useLocalSearchParams<{
    code: string | string[];
    amount?: string | string[];
    nick?: string | string[];
  }>();

  const roomCode: string =
    typeof raw.code === "string" ? raw.code : raw.code?.[0] ?? "";
  const amountStr: string | undefined =
    typeof raw.amount === "string" ? raw.amount : raw.amount?.[0];
  const nickStr: string | undefined =
    typeof raw.nick === "string" ? raw.nick : raw.nick?.[0];

  const amount = amountStr ? Number(amountStr) : 0;
  const nickname = nickStr ?? "나";

  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 60,
    smoothing: 0.2,
    shakeThreshold: 0.9,
  });

  const [status, setStatus] = useState<
    "lobby" | "countdown" | "playing" | "finished"
  >("lobby");
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (!roomCode) return;
    const tm = setInterval(async () => {
      await molbbangApi.fetchRoom(roomCode);
      // TODO: 수신 상태에 따라 setStatus / setRound
    }, 1500);
    return () => clearInterval(tm);
  }, [roomCode]);

  const onStart = useCallback(() => {
    setStatus("countdown");
    setTimeout(() => {
      reset();
      setStatus("playing");
      setTimeout(() => onFinishRound(), 7000); // 7초 라운드
    }, 2000);
  }, [reset]);

  const onFinishRound = useCallback(async () => {
    setStatus("finished");
    await molbbangApi.submitScore(roomCode, Math.round(shakeValue));
    Alert.alert("라운드 종료", `내 점수: ${Math.round(shakeValue)}`, [
      {
        text: "다음 라운드",
        onPress: () => {
          setRound((r) => r + 1);
          reset();
          setStatus("lobby");
        },
      },
      { text: "나가기", onPress: () => router.back() },
    ]);
  }, [roomCode, shakeValue, reset, router]);

  // 3) 딥링크/공유 링크 (tabs 경로 제거)
  const onShareLink = useCallback(async () => {
    const url = `myapp://molbbang/room/${roomCode}?nick=${encodeURIComponent(
      nickname
    )}&amount=${amount}`;
    await Share.share({ message: `몰빵 방 입장 링크: ${url}` });
  }, [roomCode, nickname, amount]);

  const onShowQr = useCallback(() => {
    Alert.alert(
      "QR은 곧 연결!",
      "react-native-qrcode-svg를 템플릿에 붙이면 바로 띄울 수 있어."
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MolbbangRoomTemplate
        code={roomCode}
        amount={amount}
        status={status}
        round={round}
        magnitude={magnitude}
        myScore={shakeValue}
        onStart={onStart}
        onFinishRound={onFinishRound}
        onShareLink={onShareLink}
        onShowQr={onShowQr}
        idleImage={idlePng}
        shakeImage={shakePng}
      />
    </View>
  );
}
