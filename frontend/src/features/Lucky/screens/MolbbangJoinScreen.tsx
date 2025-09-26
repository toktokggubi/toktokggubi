import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import JoinRoomTemplate from "@/features/Lucky/templates/Molbbang/JoinRoomTemplate";

export default function MolbbangJoinScreen() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("참가자");

  const handleJoin = useCallback(async () => {
    if (code.trim().length < 4) return Alert.alert("코드를 정확히 입력해줘!");
    const upper = code.trim().toUpperCase();

    const res = await molbbangApi.joinRoom({ code: upper, nickname });
    if (!res.ok) return Alert.alert("입장 실패");

    const lobbyParams = { code: upper, nick: nickname };

    console.log("🔍 [방 참가] 대기방으로 파라미터 전달:", {
      pathname: "/molbbang/room/[code]",
      params: lobbyParams,
    });

    router.replace({
      pathname: "/molbbang/room/[code]",
      params: lobbyParams,
    });
  }, [code, nickname]);

  return (
    <JoinRoomTemplate
      nickname={nickname}
      code={code}
      onChangeNickname={setNickname}
      onChangeCode={setCode}
      onSubmit={handleJoin}
    />
  );
}
