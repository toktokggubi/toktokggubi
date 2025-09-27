package com.ssafy.toktokggubi.domain.molbbang.dto.request;

import jakarta.validation.constraints.NotNull;

public record SubmitMyScoreRequest(@NotNull Integer score) {}
