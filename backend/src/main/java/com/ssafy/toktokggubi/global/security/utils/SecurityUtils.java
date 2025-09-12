package com.ssafy.toktokggubi.global.security.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {}
    public static Long currentUserIdOrNull() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null) return null;
        try { return Long.valueOf(a.getName()); } catch (Exception e) { return null; }
    }
}