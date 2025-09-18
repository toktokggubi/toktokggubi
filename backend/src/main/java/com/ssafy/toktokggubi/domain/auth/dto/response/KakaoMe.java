package com.ssafy.toktokggubi.domain.auth.dto.response;

import java.util.Map;

public record KakaoMe(Long id, Map<String,Object> kakao_account, Map<String,Object> properties) {}