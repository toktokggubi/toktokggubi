package com.ssafy.toktokggubi.domain.molbbang.service;

import com.ssafy.toktokggubi.domain.molbbang.dto.request.CreateRoomRequest;
import com.ssafy.toktokggubi.domain.molbbang.dto.response.*;
import com.ssafy.toktokggubi.domain.molbbang.entity.*;
import com.ssafy.toktokggubi.domain.molbbang.repository.MolbbangMemberRepository;
import com.ssafy.toktokggubi.domain.molbbang.repository.MolbbangRoomRepository;
import com.ssafy.toktokggubi.domain.molbbang.repository.MolbbangScoreRepository;
import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class MolbbangService {

    private final MolbbangRoomRepository roomRepo;
    private final MolbbangMemberRepository memberRepo;
    private final MolbbangScoreRepository scoreRepo;
    private final SimpMessagingTemplate messagingTemplate;

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    /* ===== 유틸 ===== */
    @Transactional(readOnly = true)
    public RoomView getRoom(String code) {
        MolbbangRoom room = roomRepo.findByRoomCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        var members = memberRepo.findByRoom_RoomIdAndActiveTrue(room.getRoomId());
        var mv = members.stream()
                .map(m -> new RoomView.MemberView(
                        m.getMemberId(),
                        m.getUser().getUserId(),
                        m.getNickname(),
                        m.isReady(),
                        m.isHost(),
                        m.isActive()
                ))
                .toList();

        return new RoomView(
                room.getRoomCode(),
                room.getAmount(),
                room.getStatus().name(),
                room.getStartedAt(),
                mv
        );
    }

    private void broadcastRoom(String code) {
        RoomView view = getRoom(code);
        messagingTemplate.convertAndSend("/topic/molbbang." + code, view);
    }

    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder(6);
        ThreadLocalRandom r = ThreadLocalRandom.current();
        for (int i = 0; i < 6; i++) sb.append(chars.charAt(r.nextInt(chars.length())));
        return sb.toString();
    }

    private MolbbangRoom getRoomByCodeOrThrow(String code) {
        return roomRepo.findByRoomCode(code).orElseThrow(() -> new EntityNotFoundException("Room not found"));
    }

    private MolbbangRoom getActiveRoomOfUserOrThrow(Long userId) {
        var list = memberRepo.findByUser_UserIdAndActiveTrue(userId);
        if (list.isEmpty()) throw new IllegalStateException("현재 참가 중인 방이 없습니다.");
        if (list.size() > 1) {
            list.stream().skip(1).forEach(m ->
                    memberRepo.save(m.toBuilder().active(false).leftAt(LocalDateTime.now()).build())
            );
        }
        return list.get(0).getRoom();
    }

    private String pickUniqueNickname(MolbbangRoom room, String desired) {
        String base = isBlank(desired) ? "사용자" : desired.trim();
        Long roomId = room.getRoomId();

        String candidate = base; int suffix = 1;
        while (memberRepo.existsByRoom_RoomIdAndNickname(roomId, candidate)) {
            suffix++;
            String sfx = String.valueOf(suffix);
            int keep = Math.max(1, 50 - sfx.length());
            String head = base.length() > keep ? base.substring(0, keep) : base;
            candidate = head + sfx;
        }
        return candidate;
    }

    /* ===== 상태 조회 ===== */

    @Transactional
    public IsHostResponse checkMyHostStatus(Long userId) {
        try {
            MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
            var member = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId).orElse(null);
            boolean isHost = (member != null) && member.isHost();
            return IsHostResponse.builder()
                    .inRoom(true).isHost(isHost).roomCode(room.getRoomCode()).build();
        } catch (IllegalStateException e) {
            return IsHostResponse.builder().inRoom(false).isHost(false).roomCode(null).build();
        }
    }

    @Transactional(readOnly = true)
    public RoomView myRoom(Long userId) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        return getRoom(room.getRoomCode());
    }

    /* ===== 생성/입장/퇴장 ===== */

    @Transactional
    public CreateRoomResponse createRoom(CreateRoomRequest req, User hostUser) {
        // 유저가 이미 다른 방에 active면 정리
        memberRepo.findByUser_UserIdAndActiveTrue(hostUser.getUserId())
                .forEach(m -> memberRepo.save(m.toBuilder()
                        .active(false).ready(false).leftAt(LocalDateTime.now()).build()));

        if (!memberRepo.findByUser_UserIdAndActiveTrue(hostUser.getUserId()).isEmpty()) {
            throw new IllegalStateException("이미 다른 방에 참여 중입니다.");
        }

        String code;
        do { code = generateCode(); } while (roomRepo.findByRoomCode(code).isPresent());

        MolbbangRoom room = MolbbangRoom.builder()
                .roomCode(code)
                .hostUser(hostUser)
                .amount(req.amount())
                .status(RoomStatus.LOBBY)
                .build();
        roomRepo.save(room);

        String desired = isBlank(req.nickname()) ? hostUser.getNickname() : req.nickname();
        String unique = pickUniqueNickname(room, desired);

        MolbbangMember host = MolbbangMember.builder()
                .room(room).user(hostUser).nickname(unique)
                .host(true).ready(false).active(true)
                .build();
        memberRepo.save(host);

        broadcastRoom(code);
        return new CreateRoomResponse(code);
    }

    @Transactional
    public OkResponse joinRoom(String code, String nickname, User user) {
        memberRepo.findByUser_UserIdAndActiveTrue(user.getUserId())
                .forEach(m -> memberRepo.save(m.toBuilder()
                        .active(false).ready(false).leftAt(LocalDateTime.now()).build()));

        if (!memberRepo.findByUser_UserIdAndActiveTrue(user.getUserId()).isEmpty()) {
            throw new IllegalStateException("이미 다른 방에 참여 중입니다.");
        }

        MolbbangRoom room = getRoomByCodeOrThrow(code);
        if (room.getStatus() != RoomStatus.LOBBY) throw new IllegalStateException("Room not joinable");

        String desired = isBlank(nickname) ? user.getNickname() : nickname;
        String unique = pickUniqueNickname(room, desired);

        MolbbangMember member = MolbbangMember.builder()
                .room(room).user(user).nickname(unique)
                .host(false).ready(false).active(true)
                .build();
        memberRepo.save(member);

        broadcastRoom(code);
        return new OkResponse(true);
    }

    @Transactional
    public OkResponse leaveRoom(String code, Long userId) {
        MolbbangRoom room = getRoomByCodeOrThrow(code);
        MolbbangMember member = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (!member.isActive()) { broadcastRoom(code); return new OkResponse(true); }

        memberRepo.save(member.toBuilder()
                .active(false).ready(false).leftAt(LocalDateTime.now()).build());

        if (member.isHost()) {
            roomRepo.save(room.toBuilder()
                    .status(RoomStatus.CANCELLED)
                    .endedAt(LocalDateTime.now())
                    .build());
            memberRepo.findByRoom_RoomIdAndActiveTrue(room.getRoomId())
                    .forEach(m -> memberRepo.save(m.toBuilder()
                            .active(false).ready(false).leftAt(LocalDateTime.now()).build()));
        }

        broadcastRoom(code);
        return new OkResponse(true);
    }

    /* ===== 준비/시작/종료/결과/점수 ===== */

    @Transactional
    public OkResponse setReadyForMe(Long userId, boolean ready) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        MolbbangMember m = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        memberRepo.save(m.toBuilder().ready(ready).build());
        broadcastRoom(room.getRoomCode());
        return new OkResponse(true);
    }

    @Transactional
    public StartGameResponse startMyGame(Long userId) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        MolbbangMember me = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (!me.isHost()) throw new IllegalStateException("호스트만 시작할 수 있습니다.");
        if (room.getStatus() == RoomStatus.FINISHED || room.getStatus() == RoomStatus.CANCELLED)
            throw new IllegalStateException("Game closed");
        if (room.getStatus() == RoomStatus.IN_PROGRESS)
            throw new IllegalStateException("already_started");

        var members = memberRepo.findByRoom_RoomIdAndActiveTrue(room.getRoomId());
        if (members.isEmpty()) throw new IllegalStateException("not_enough_members");
        if (!members.stream().allMatch(MolbbangMember::isReady)) throw new IllegalStateException("not_ready");

        roomRepo.save(room.toBuilder()
                .status(RoomStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build());

        broadcastRoom(room.getRoomCode());
        return new StartGameResponse(true, "in_progress");
    }

    @Transactional
    public EndGameResponse endMyGame(Long userId) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        MolbbangMember me = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (!me.isHost()) throw new IllegalStateException("호스트만 종료할 수 있습니다.");
        if (room.getStatus() != RoomStatus.IN_PROGRESS)
            throw new IllegalStateException("not_in_progress");

        roomRepo.save(room.toBuilder()
                .status(RoomStatus.FINISHED)
                .endedAt(LocalDateTime.now())
                .build());

        // 종료 시 모든 멤버 비활성화
        memberRepo.findByRoom_RoomIdAndActiveTrue(room.getRoomId())
                .forEach(m -> memberRepo.save(m.toBuilder()
                        .active(false).ready(false).leftAt(LocalDateTime.now()).build()));

        broadcastRoom(room.getRoomCode());
        return new EndGameResponse(true, "finished");
    }

    @Transactional(readOnly = true)
    public ResultsResponse resultsForMe(Long userId) {
        MolbbangRoom room;
        try {
            room = roomRepo.findTopByMembers_User_UserIdAndStatusOrderByEndedAtDesc(userId, RoomStatus.FINISHED)
                    .orElseThrow(() -> new IllegalStateException("최근 종료된 방이 없습니다."));
        } catch (IllegalStateException e) {
            room = getActiveRoomOfUserOrThrow(userId);
        }
        if (room.getStatus() != RoomStatus.FINISHED) throw new IllegalStateException("not_finished");
        return getResultsInTx(room);
    }

    private ResultsResponse getResultsInTx(MolbbangRoom room) {
        List<Object[]> rows = scoreRepo.aggregateRoomTotals(room.getRoomId()); // [memberId, userId, nickname, totalScore]
        List<Object[]> sorted = rows.stream()
                .sorted((a, b) -> Integer.compare(((Number) b[3]).intValue(), ((Number) a[3]).intValue()))
                .toList();

        List<ResultsResponse.RankingRow> ranking = new ArrayList<>();
        int idx = 0, lastRank = 0;
        Integer lastScore = null;
        for (Object[] r : sorted) {
            idx++;
            int score = ((Number) r[3]).intValue();
            if (!Objects.equals(lastScore, score)) { lastRank = idx; lastScore = score; }
            ranking.add(new ResultsResponse.RankingRow(
                    ((Number) r[1]).longValue(), (String) r[2], score, lastRank
            ));
        }

        Long jackpotUserId = null;
        if (!sorted.isEmpty()) {
            int minScore = ((Number) sorted.get(sorted.size() - 1)[3]).intValue();
            long losers = sorted.stream().filter(r -> ((Number) r[3]).intValue() == minScore).count();
            if (losers == 1) {
                Object[] loser = sorted.get(sorted.size() - 1);
                jackpotUserId = ((Number) loser[1]).longValue();
            }
        }
        return new ResultsResponse(true, ranking, jackpotUserId, room.getAmount());
    }

    @Transactional
    public OkResponse submitMyScore(Long userId, int score) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        if (room.getStatus() != RoomStatus.IN_PROGRESS) throw new IllegalStateException("not_in_game");

        MolbbangMember me = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (scoreRepo.existsByRoom_RoomIdAndMember_MemberId(room.getRoomId(), me.getMemberId())) {
            throw new IllegalStateException("already_submitted");
        }

        scoreRepo.save(MolbbangScore.builder()
                .room(room)
                .member(me)
                .score(score)
                .build());

        broadcastRoom(room.getRoomCode());
        return new OkResponse(true);
    }
}
