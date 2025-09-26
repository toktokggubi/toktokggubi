// com.ssafy.toktokggubi.domain.molbbang.controller.MolbbangController.java
package com.ssafy.toktokggubi.domain.molbbang.controller;

import com.ssafy.toktokggubi.domain.molbbang.dto.request.*;
import com.ssafy.toktokggubi.domain.molbbang.dto.response.*;
import com.ssafy.toktokggubi.domain.molbbang.service.MolbbangService;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
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
public class MolbbangController {

    private final MolbbangService service;
    private final UserRepository userRepo;

    private Long uid(Principal p) { return Long.valueOf(p.getName()); }

    @PostMapping
    public CreateRoomResponse createRoom(@Valid @RequestBody CreateRoomRequest req, Principal principal) {
        User host = userRepo.findById(uid(principal)).orElseThrow();
        return service.createRoom(req, host);
    }

    @PostMapping("/join")
    public OkResponse join(@Valid @RequestBody JoinRoomRequest req, Principal principal) {
        User user = userRepo.findById(uid(principal)).orElseThrow();
        return service.joinRoom(req.code(), req.nickname(), user);
    }

    @GetMapping("/me")
    public RoomView myRoom(Principal principal) {
        return service.myRoom(uid(principal));
    }

    @PatchMapping("/me/ready")
    public OkResponse readyMe(@RequestBody ReadyRequest req, Principal principal) {
        return service.setReadyForMe(uid(principal), req.ready());
    }

    @PatchMapping("/me/leave")
    public OkResponse leaveMe(Principal principal) {
        return service.leaveRoom(service.myRoom(uid(principal)).roomCode(), uid(principal));
    }

    @GetMapping("/me/host")
    public IsHostResponse amIHost(Principal principal) {
        return service.checkMyHostStatus(uid(principal));
    }

    @PostMapping("/me/start")
    public StartGameResponse startMe(Principal principal) {
        return service.startMyGame(uid(principal));
    }

    @PostMapping("/me/end")
    public EndGameResponse endMe(Principal principal) {
        return service.endMyGame(uid(principal));
    }

    @PostMapping("/me/score")
    public OkResponse submitMyScore(@RequestBody @Valid SubmitMyScoreRequest req, Principal principal) {
        return service.submitMyScore(uid(principal), req.score());
    }

    @GetMapping("/me/results")
    public ResultsResponse resultsMe(Principal principal) {
        return service.resultsForMe(uid(principal));
    }

    /* ===== WebSocket (STOMP) ===== */
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
