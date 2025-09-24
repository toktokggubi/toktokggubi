package com.ssafy.toktokggubi.domain.molbbang.controller;

import com.ssafy.toktokggubi.domain.molbbang.dto.request.*;
import com.ssafy.toktokggubi.domain.molbbang.dto.response.*;
import com.ssafy.toktokggubi.domain.molbbang.service.MolbbangService;
import com.ssafy.toktokggubi.domain.user.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/molbbang")
@RequiredArgsConstructor
@Tag(name = "몰빵 게임", description = "몰빵 게임 API")
public class MolbbangController {

    private final MolbbangService service;
    private final com.ssafy.toktokggubi.domain.user.repository.UserRepository userRepo;

    private Long uid(Principal p) {
        return Long.valueOf(p.getName());
    }

    @PostMapping
    public CreateRoomResponse createRoom(@Valid @RequestBody CreateRoomRequest req, Principal principal) {
        Long userId = uid(principal);
        User host = userRepo.findById(userId).orElseThrow();
        return service.createRoom(req, host);
    }

    @PostMapping("/join")
    public OkResponse join(@Valid @RequestBody JoinRoomRequest req, Principal principal) {
        Long userId = uid(principal);
        User user = userRepo.findById(userId).orElseThrow();
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
        return service.leaveMyRoom(uid(principal));
    }

    @PostMapping("/me/start")
    public StartRoundResponse startMe(Principal principal) {
        return service.startMyRoom(uid(principal));
    }

    @PostMapping("/me/endRound")
    public RoundTransitionResponse endRoundMe(Principal principal) {
        return service.endMyRound(uid(principal));
    }

    @PostMapping("/me/score")
    public OkResponse submitMyScore(@RequestBody @Valid SubmitMyScoreRequest req, Principal principal) {
        return service.submitMyScore(uid(principal), req.score());
    }

    @GetMapping("/me/results")
    public ResultsResponse resultsMe(Principal principal) {
        return service.resultsForMe(uid(principal));
    }

    @MessageMapping("molbbang/me/ready")
    public void wsReadyMe(ReadyRequest req, Principal principal) {
        service.setReadyForMe(uid(principal), req.ready());
    }

    @MessageMapping("molbbang/me/start")
    public void wsStartMe(Principal principal) {
        service.startMyRoom(uid(principal));
    }

    @MessageMapping("molbbang/me/end")
    public void wsEndMe(Principal principal) {
        service.endMyRound(uid(principal));
    }

    @MessageMapping("molbbang/me/score")
    public void wsSubmitMyScore(SubmitMyScoreRequest req, Principal principal) {
        service.submitMyScore(uid(principal), req.score());
    }
}
