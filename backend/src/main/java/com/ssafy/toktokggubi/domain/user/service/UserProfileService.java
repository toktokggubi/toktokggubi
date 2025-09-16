package com.ssafy.toktokggubi.domain.user.service;

import com.ssafy.toktokggubi.domain.user.dto.request.*;
import com.ssafy.toktokggubi.domain.user.dto.response.*;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.entity.UserStatus;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return ProfileResponse.builder()
                .userId(u.getUserId())
                .nickname(u.getNickname())
                .gender(u.getGender())
                .ageGroup(u.getAgeGroup())
                .jobTitle(u.getJobTitle())
                .monthlyIncome(u.getMonthlyIncome())
                .build();
    }

    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequest req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        var b = u.toBuilder();
        if (req.nickname() != null) b.nickname(req.nickname());
        if (req.ageGroup() != null) b.ageGroup(req.ageGroup());
        if (req.jobTitle() != null) b.jobTitle(req.jobTitle());
        if (req.monthlyIncome() != null) b.monthlyIncome(req.monthlyIncome());
        userRepository.save(b.build());
    }
}