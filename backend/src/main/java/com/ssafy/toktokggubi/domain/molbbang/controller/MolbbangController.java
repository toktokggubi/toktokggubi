package com.ssafy.toktokggubi.domain.molbbang.controller;

import com.ssafy.toktokggubi.domain.molbbang.dto.request.CreateRoomRequest;
import com.ssafy.toktokggubi.domain.molbbang.dto.request.JoinRoomRequest;
import com.ssafy.toktokggubi.domain.molbbang.dto.request.ReadyRequest;
import com.ssafy.toktokggubi.domain.molbbang.dto.request.SubmitMyScoreRequest;
import com.ssafy.toktokggubi.domain.molbbang.dto.response.*;
import com.ssafy.toktokggubi.domain.molbbang.service.MolbbangService;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/molbbang")
@RequiredArgsConstructor
@Tag(name = "몰빵 게임", description = "몰빵 게임 API (라운드 없음)")
@SecurityRequirement(name = "bearerAuth") // 스키마는 OpenAPI 설정에서 정의
public class MolbbangController {

    private final MolbbangService service;
    private final UserRepository userRepo;

    private Long uid(Principal p) {
        return Long.valueOf(p.getName());
    }

    @Operation(
            summary = "방 생성",
            description = "몰빵 방을 만들고 호스트로 입장합니다. 상태는 LOBBY로 시작합니다."
    )
    @PostMapping
    public CreateRoomResponse createRoom(
            @Valid @RequestBody CreateRoomRequest req,
            @Parameter(hidden = true) Principal principal
    ) {
        User host = userRepo.findById(uid(principal)).orElseThrow();
        return service.createRoom(req, host);
    }

    @Operation(
            summary = "방 참가",
            description = "방 코드를 통해 LOBBY 상태의 방에 참가합니다."
    )
    @PostMapping("/join")
    public OkResponse join(
            @Valid @RequestBody JoinRoomRequest req,
            @Parameter(hidden = true) Principal principal
    ) {
        User user = userRepo.findById(uid(principal)).orElseThrow();
        return service.joinRoom(req.code(), req.nickname(), user);
    }

    @Operation(
            summary = "내 방 상태 조회",
            description = "현재 내가 참여 중(active)인 방의 상태/멤버 목록을 반환합니다."
    )
    @GetMapping("/me")
    public RoomView myRoom(@Parameter(hidden = true) Principal principal) {
        return service.myRoom(uid(principal));
    }

    @Operation(
            summary = "내 준비 상태 토글",
            description = "내 준비 상태를 true/false로 설정합니다."
    )
    @PatchMapping("/me/ready")
    public OkResponse readyMe(
            @RequestBody ReadyRequest req,
            @Parameter(hidden = true) Principal principal
    ) {
        return service.setReadyForMe(uid(principal), req.ready());
    }

    @Operation(
            summary = "방 나가기",
            description = "현재 방에서 나갑니다. 호스트가 나가면 방이 CANCELLED로 종료되고 모든 멤버가 비활성화됩니다."
    )
    @PatchMapping("/me/leave")
    public OkResponse leaveMe(@Parameter(hidden = true) Principal principal) {
        Long uid = Long.valueOf(principal.getName());

        return service.findActiveRoomCode(uid)
                .map(code -> service.leaveRoom(code, uid))
                .orElseGet(() -> new OkResponse(true));
    }

    @Operation(
            summary = "내 호스트 여부",
            description = "현재 참여 중인 방에서 내가 호스트인지 반환합니다."
    )
    @GetMapping("/me/host")
    public IsHostResponse amIHost(@Parameter(hidden = true) Principal principal) {
        return service.checkMyHostStatus(uid(principal));
    }

    @Operation(
            summary = "게임 시작(호스트)",
            description = "모든 유저가 준비 상태일 때, 호스트만 게임을 시작할 수 있습니다. 방 상태가 IN_PROGRESS가 됩니다."
    )
    @PostMapping("/me/start")
    public StartGameResponse startMe(@Parameter(hidden = true) Principal principal) {
        return service.startMyGame(uid(principal));
    }

    @Operation(
            summary = "게임 종료(호스트)",
            description = "게임을 종료하고 방 상태를 FINISHED로 변경합니다. 모든 멤버는 비활성화됩니다."
    )
    @PostMapping("/me/end")
    public EndGameResponse endMe(@Parameter(hidden = true) Principal principal) {
        return service.endMyGame(uid(principal));
    }

    @Operation(
            summary = "내 점수 제출",
            description = "게임 진행(IN_PROGRESS) 상태에서 각 유저가 1회 점수를 제출합니다."
    )
    @PostMapping("/me/score")
    public OkResponse submitMyScore(
            @Valid @RequestBody SubmitMyScoreRequest req,
            @Parameter(hidden = true) Principal principal
    ) {
        return service.submitMyScore(uid(principal), req.score());
    }

    @Operation(
            summary = "결과 조회",
            description = "가장 최근에 종료된 방의 결과를 조회하거나(있다면), 아니면 현재 방 상태를 확인합니다. FINISHED 상태가 아니면 not_finished 에러."
    )
    @GetMapping("/me/results")
    public ResultsResponse resultsMe(@Parameter(hidden = true) Principal principal) {
        return service.resultsForMe(uid(principal));
    }

    /* ===== WebSocket (STOMP) — Swagger에 노출되지 않음 ===== */
    @MessageMapping("molbbang/me/ready")
    public void wsReadyMe(ReadyRequest req, Principal principal) {
        service.setReadyForMe(uid(principal), req.ready());
    }

    @MessageMapping("molbbang/me/start")
    public void wsStartMe(Principal principal) {
        service.startMyGame(uid(principal));
    }

    @MessageMapping("molbbang/me/end")
    public void wsEndMe(Principal principal) {
        service.endMyGame(uid(principal));
    }

    @MessageMapping("molbbang/me/score")
    public void wsSubmitMyScore(SubmitMyScoreRequest req, Principal principal) {
        service.submitMyScore(uid(principal), req.score());
    }
}
