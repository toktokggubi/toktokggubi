package com.ssafy.toktokggubi.domain.molbbang.service;

import com.ssafy.toktokggubi.domain.molbbang.dto.request.CreateRoomRequest;
import com.ssafy.toktokggubi.domain.molbbang.dto.response.*;
import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangMember;
import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangRoom;
import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangScore;
import com.ssafy.toktokggubi.domain.molbbang.entity.RoomStatus;
import com.ssafy.toktokggubi.domain.molbbang.repository.MolbbangMemberRepository;
import com.ssafy.toktokggubi.domain.molbbang.repository.MolbbangRoomRepository;
import com.ssafy.toktokggubi.domain.molbbang.repository.MolbbangScoreRepository;
import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MolbbangService {

    private final MolbbangRoomRepository roomRepo;
    private final MolbbangMemberRepository memberRepo;
    private final MolbbangScoreRepository scoreRepo;
    private final SimpMessagingTemplate messagingTemplate;

    /* ====== 인메모리 종료대기(Armed) & 타이머 ====== */
    private static final int GRACE_SECONDS = 10;
    private final Map<Long, Boolean> autoEndArmed = new ConcurrentHashMap<>();
    private final Map<Long, ScheduledFuture<?>> scheduledFinalizers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

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

    private void broadcastResults(MolbbangRoom room) {
        var results = getResultsInTx(room);
        messagingTemplate.convertAndSend("/topic/molbbang." + room.getRoomCode() + ".results", results);
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

        String candidate = base;
        int suffix = 1;
        while (memberRepo.existsByRoom_RoomIdAndNickname(roomId, candidate)) {
            suffix++;
            String sfx = String.valueOf(suffix);
            int keep = Math.max(1, 50 - sfx.length());
            String head = base.length() > keep ? base.substring(0, keep) : base;
            candidate = head + sfx;
        }
        return candidate;
    }

    private MolbbangRoom getLatestFinishedRoomOfUserOrThrow(Long userId) {
        var rooms = roomRepo.findRecentRoomsByUserAndStatus(
                userId,
                RoomStatus.FINISHED,
                PageRequest.of(0, 1)
        );
        return rooms.stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("최근 종료된 방이 없습니다."));
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
        // 기존 active 정리
        memberRepo.findByUser_UserIdAndActiveTrue(hostUser.getUserId())
                .forEach(m -> memberRepo.save(m.toBuilder()
                        .active(false).ready(false).leftAt(LocalDateTime.now()).build()));

        if (!memberRepo.findByUser_UserIdAndActiveTrue(hostUser.getUserId()).isEmpty()) {
            throw new IllegalStateException("이미 다른 방에 참여 중입니다.");
        }

        String code;
        do {
            code = generateCode();
        } while (roomRepo.findByRoomCode(code).isPresent());

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
        // 기존 active 정리
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

    /**
     * - active가 남아 있으면 joinedAt ASC로 결정적 호스트 위임
     * - 아무도 없으면 CANCELLED
     * - LOBBY에서 전원 이탈 시 CANCELLED
     */
    @Transactional
    public OkResponse leaveRoom(String code, Long userId) {
        MolbbangRoom room = getRoomByCodeOrThrow(code);
        MolbbangMember member = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (!member.isActive()) {
            broadcastRoom(code);
            return new OkResponse(true);
        }

        // 이 멤버 비활성화
        memberRepo.save(member.toBuilder()
                .active(false).ready(false).leftAt(LocalDateTime.now()).build());

        // 남은 active들
        List<MolbbangMember> actives = memberRepo.findByRoom_RoomIdAndActiveTrue(room.getRoomId());

        if (member.isHost()) {
            if (!actives.isEmpty()) {
                // 결정적 위임(가장 먼저 들어온 사람)
                MolbbangMember newHost = actives.stream()
                        .min(Comparator.comparing(MolbbangMember::getJoinedAt)).get();
                memberRepo.save(member.toBuilder().host(false).build()); // 이전 호스트 내림
                memberRepo.save(newHost.toBuilder().host(true).build()); // 새 호스트 지정
            } else {
                // 아무도 없으면 취소
                roomRepo.save(room.toBuilder()
                        .status(RoomStatus.CANCELLED)
                        .endedAt(LocalDateTime.now())
                        .build());
            }
        } else {
            // 일반 멤버: 로비에서 전원 이탈 시 취소
            if (room.getStatus() == RoomStatus.LOBBY && actives.isEmpty()) {
                roomRepo.save(room.toBuilder()
                        .status(RoomStatus.CANCELLED)
                        .endedAt(LocalDateTime.now())
                        .build());
            }
        }

        broadcastRoom(code);
        return new OkResponse(true);
    }

    /* ===== 준비/시작/종료/점수 ===== */

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

        // 혹시 이전 방에서 무언가 armed가 남아있었다면 해제
        autoEndArmed.remove(room.getRoomId());
        cancelScheduledFinalizer(room.getRoomId());

        broadcastRoom(room.getRoomCode());
        return new StartGameResponse(true, "in_progress");
    }

    /* ===== 종료 대기(Armed) 플로우 ===== */

    /** startedAt 기준으로 시작 당시 방에 있던 멤버 수 계산 */
    private int countRequiredMembers(MolbbangRoom room) {
        LocalDateTime startedAt = room.getStartedAt();
        if (startedAt == null) return 0;
        List<MolbbangMember> allMembers = memberRepo.findByRoom_RoomId(room.getRoomId());
        return (int) allMembers.stream()
                .filter(m -> m.getJoinedAt() != null && !m.getJoinedAt().isAfter(startedAt))
                .filter(m -> m.getLeftAt() == null || !m.getLeftAt().isBefore(startedAt))
                .count();
    }

    /** 미제출자 0점 보정 → FINISHED → 브로드캐스트 */
    @Transactional
    public void finalizeRoomWithZeroFill(Long roomId) {
        MolbbangRoom room = roomRepo.findById(roomId).orElse(null);
        if (room == null) return;
        if (room.getStatus() != RoomStatus.IN_PROGRESS) return; // 이미 종료/취소 시 무시

        LocalDateTime startedAt = room.getStartedAt();
        if (startedAt == null) return;

        List<MolbbangMember> allMembers = memberRepo.findByRoom_RoomId(room.getRoomId());
        List<MolbbangMember> expectedMembers = allMembers.stream()
                .filter(m -> m.getJoinedAt() != null && !m.getJoinedAt().isAfter(startedAt))
                .filter(m -> m.getLeftAt() == null || !m.getLeftAt().isBefore(startedAt))
                .toList();

        Set<Long> submittedMemberIds = scoreRepo.aggregateRoomTotals(room.getRoomId()).stream()
                .map(arr -> ((Number) arr[0]).longValue()) // memberId
                .collect(Collectors.toSet());

        for (MolbbangMember m : expectedMembers) {
            if (!submittedMemberIds.contains(m.getMemberId())) {
                scoreRepo.save(MolbbangScore.builder()
                        .room(room)
                        .member(m)
                        .score(0)
                        .build());
            }
        }

        roomRepo.save(room.toBuilder()
                .status(RoomStatus.FINISHED)
                .endedAt(LocalDateTime.now())
                .build());

        // 종료 시 모든 멤버 비활성화
        memberRepo.findByRoom_RoomIdAndActiveTrue(room.getRoomId())
                .forEach(m -> memberRepo.save(m.toBuilder()
                        .active(false).ready(false).leftAt(LocalDateTime.now()).build()));

        // armed/타이머 해제
        autoEndArmed.remove(room.getRoomId());
        cancelScheduledFinalizer(room.getRoomId());

        broadcastResults(room);
        broadcastRoom(room.getRoomCode());
    }

    private void cancelScheduledFinalizer(Long roomId) {
        ScheduledFuture<?> f = scheduledFinalizers.remove(roomId);
        if (f != null) {
            f.cancel(false);
        }
    }

    /**
     * 호스트가 누르면: 즉시 종료하지 않고 Armed 설정 + 그레이스 타이머 등록.
     * - 전원 제출 완료면 즉시 finalize
     * - 아니면 'pending' 반환, GRACE_SECONDS 후 강제 finalize(0점 보정)
     */
    @Transactional
    public EndGameResponse endMyGame(Long userId) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        MolbbangMember me = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (!me.isHost()) throw new IllegalStateException("호스트만 종료할 수 있습니다.");
        if (room.getStatus() != RoomStatus.IN_PROGRESS)
            throw new IllegalStateException("not_in_progress");

        int required = countRequiredMembers(room);
        long submitted = scoreRepo.countByRoom_RoomId(room.getRoomId());

        // Armed 설정
        autoEndArmed.put(room.getRoomId(), true);

        if (submitted >= required) {
            // 이미 모두 제출 완료 → 즉시 마감
            finalizeRoomWithZeroFill(room.getRoomId());
            return new EndGameResponse(true, "finished");
        }

        // 그레이스 타이머 예약 (기존 예약이 있으면 취소 후 재예약)
        cancelScheduledFinalizer(room.getRoomId());
        ScheduledFuture<?> future = scheduler.schedule(() -> {
            try {
                finalizeRoomWithZeroFill(room.getRoomId());
            } catch (Exception ignore) {}
        }, GRACE_SECONDS, TimeUnit.SECONDS);
        scheduledFinalizers.put(room.getRoomId(), future);

        // 대기 상태 응답(프론트는 카운트다운/대기 UI)
        return new EndGameResponse(true, "pending");
    }

    @Transactional(readOnly = true)
    public ResultsResponse resultsForMe(Long userId) {
        MolbbangRoom room;
        try {
            room = getLatestFinishedRoomOfUserOrThrow(userId);
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
            if (!Objects.equals(lastScore, score)) {
                lastRank = idx;
                lastScore = score;
            }
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

    /**
     * - 시작시점 스냅샷(시간 기준)에 포함되지 않은 멤버의 제출은 거부(not_in_snapshot)
     * - armed 상태라면 제출 후 전원 제출 완료 시 자동 finalize
     */
    @Transactional
    public OkResponse submitMyScore(Long userId, int score) {
        MolbbangRoom room = getActiveRoomOfUserOrThrow(userId);
        if (room.getStatus() != RoomStatus.IN_PROGRESS) throw new IllegalStateException("not_in_game");

        MolbbangMember me = memberRepo.findByRoom_RoomIdAndUser_UserId(room.getRoomId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        // 시작시점 스냅샷 포함 여부(시간 기준)
        LocalDateTime startedAt = room.getStartedAt();
        if (startedAt == null) throw new IllegalStateException("invalid_started_at");
        if (me.getJoinedAt() != null && me.getJoinedAt().isAfter(startedAt)) {
            throw new IllegalStateException("not_in_snapshot");
        }
        if (me.getLeftAt() != null && me.getLeftAt().isBefore(startedAt)) {
            throw new IllegalStateException("not_in_snapshot");
        }

        if (scoreRepo.existsByRoom_RoomIdAndMember_MemberId(room.getRoomId(), me.getMemberId())) {
            throw new IllegalStateException("already_submitted");
        }

        scoreRepo.save(MolbbangScore.builder()
                .room(room)
                .member(me)
                .score(score)
                .build());

        // Armed + 전원 제출 완료 시 즉시 마감
        if (Boolean.TRUE.equals(autoEndArmed.get(room.getRoomId()))) {
            int required = countRequiredMembers(room);
            long submitted = scoreRepo.countByRoom_RoomId(room.getRoomId());
            if (submitted >= required) {
                finalizeRoomWithZeroFill(room.getRoomId());
                return new OkResponse(true);
            }
        }

        // 진행중 방송(선택)
        broadcastRoom(room.getRoomCode());
        broadcastResults(room);
        return new OkResponse(true);
    }
}
