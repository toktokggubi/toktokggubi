package com.ssafy.toktokggubi.domain.push.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 알림 타입 표준 열거형.
 * DB(notification_log.type)에 문자열로 저장될 값과 1:1 매핑.
 */
@Schema(enumAsRef = true)
public enum PushType {

    // 임계(80%) - 전체/카테고리
    BUDGET_THRESHOLD_TOTAL_80("THRESHOLD/TOTAL"),
    BUDGET_THRESHOLD_CATEGORY_80("THRESHOLD/CATEGORY"),

    // 초과 - 전체/카테고리
    BUDGET_EXCEEDED_TOTAL("EXCEEDED/TOTAL"),
    BUDGET_EXCEEDED_CATEGORY("EXCEEDED/CATEGORY");

    private final String code;

    PushType(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }

    @Override
    public String toString() {
        return code;
    }


}
