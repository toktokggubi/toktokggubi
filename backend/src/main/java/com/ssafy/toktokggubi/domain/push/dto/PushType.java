// src/main/java/com/ssafy/toktokggubi/domain/push/dto/PushType.java
package com.ssafy.toktokggubi.domain.push.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 알림 타입 표준 열거형.
 * DB(notification_log.type)에 문자열로 저장될 값과 1:1 매핑.
 */
@Schema(enumAsRef = true)
public enum PushType {

    // 임계(80%) - 전체/카테고리
    BUDGET_THRESHOLD_TOTAL_80("BUDGET_THRESHOLD/TOTAL/80"),
    BUDGET_THRESHOLD_CATEGORY_80("BUDGET_THRESHOLD/CATEGORY/80"),

    // 초과 - 전체/카테고리
    BUDGET_EXCEEDED_TOTAL("BUDGET_EXCEEDED/TOTAL"),
    BUDGET_EXCEEDED_CATEGORY("BUDGET_EXCEEDED/CATEGORY");

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

    // 유연한 확장: 동적으로 생성하고 싶을 때
    public static PushType dynamicThreshold(boolean categoryScope, int percent) {
        if (categoryScope && percent == 80) return BUDGET_THRESHOLD_CATEGORY_80;
        if (!categoryScope && percent == 80) return BUDGET_THRESHOLD_TOTAL_80;
        // 필요하다면 여기서 다른 케이스 매핑
        throw new IllegalArgumentException("Unsupported threshold type: scope=" + categoryScope + ", percent=" + percent);
    }
}
