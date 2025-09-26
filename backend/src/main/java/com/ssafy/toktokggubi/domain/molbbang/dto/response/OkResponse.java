package com.ssafy.toktokggubi.domain.molbbang.dto.response;

import lombok.Builder;

@Builder
public record OkResponse(boolean ok, String message) {
    public OkResponse(boolean ok) { this(ok, null); }
}
