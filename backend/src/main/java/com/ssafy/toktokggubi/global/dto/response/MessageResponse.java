package com.ssafy.toktokggubi.global.dto.response;

import lombok.Builder;

public record MessageResponse(String message) {
    @Builder public MessageResponse {}
}