export const MOLBBANG_ENDPOINTS = {
  // 방 생성
  createRoom: "/molbbang",
  // 방 참가
  joinRoom: "/molbbang/join",
  // 내 방 정보 조회
  myRoom: "/molbbang/me",
  // 준비 상태 변경
  setReady: "/molbbang/me/ready",
  // 방 나가기
  leaveRoom: "/molbbang/me/leave",
  // 게임 시작
  startGame: "/molbbang/me/start",
  // 점수 제출
  submitScore: "/molbbang/me/score",
  // 게임 종료
  endGame: "/molbbang/me/end",
  // 최종 결과 조회
  getResults: "/molbbang/me/results",
  // 디버깅용 - 방 정보 상세 조회
  debugRoom: "/molbbang/me/debug",
} as const;
