package com.ssafy.toktokggubi.domain.user.controller;

import com.ssafy.toktokggubi.domain.user.dto.request.PasswordChangeRequest;
import com.ssafy.toktokggubi.domain.user.dto.request.ProfileUpdateRequest;
import com.ssafy.toktokggubi.domain.user.dto.response.ProfileResponse;
import com.ssafy.toktokggubi.domain.user.service.UserAuthService;
import com.ssafy.toktokggubi.domain.user.service.UserProfileService;
import com.ssafy.toktokggubi.global.dto.response.MessageResponse;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "유저", description = "유저 API")
public class UserController {
    private final UserAuthService authService;
    private final UserProfileService profileService;

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.OK)
    public MessageResponse changePassword(@RequestBody @Valid PasswordChangeRequest req) {
        Long uid = SecurityUtils.currentUserIdOrNull();
        if (uid == null) throw new IllegalStateException("인증 필요");
        authService.changePassword(uid, req);
        return new MessageResponse("비밀번호 변경 완료");
    }

    @DeleteMapping("/delete")
    public MessageResponse deleteAccount() {
        Long uid = SecurityUtils.currentUserIdOrNull();
        if (uid == null) throw new IllegalStateException("인증 필요");
        authService.deleteAccount(uid);
        return new MessageResponse("탈퇴 완료");
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile() {
        Long uid = SecurityUtils.currentUserIdOrNull();
        if (uid == null) throw new IllegalStateException("인증 필요");
        return profileService.getProfile(uid);
    }

    @PutMapping("/profile")
    public MessageResponse updateProfile(@RequestBody @Valid ProfileUpdateRequest req) {
        Long uid = SecurityUtils.currentUserIdOrNull();
        if (uid == null) throw new IllegalStateException("인증 필요");
        profileService.updateProfile(uid, req);
        return new MessageResponse("개인정보 수정 완료");
    }
}