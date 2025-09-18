package com.ssafy.toktokggubi.domain.gifticon.service;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GifticonTextParser {

    private static String norm(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("\\s+", "");
    }

    private static final Pattern KOREAN = Pattern.compile("[가-힣]");
    private static final Pattern BARCODE_LIKE = Pattern.compile("\\d{10,}"); // 10자리 이상 숫자
    private static final Pattern DATE_PATTERN = Pattern.compile("(20\\d{2})[./년\\- ]\\s*(\\d{1,2})[./월\\- ]\\s*(\\d{1,2})");

    // 라벨 판단 시 "브랜드명만 적힌 라인" 등 노이즈는 제외(정확히 그 토큰만 있는 라인만 제외)
    private static final Set<String> NOISE_TOKENS = Set.of(
            "br", "baskin", "robbins", "coupon", "kakaotalk", "선물하기",
            "스타벅스", "메가박스", "CGV", "롯데시네마", "이디야커피",
            "메가MGC커피", "크리스피크림", "파리바게뜨", "배스킨라빈스", "올리브영",
            "던킨", "맥도날드", "버거킹", "롯데리아", "투썸플레이스",
            "할리스", "교촌치킨", "BBQ", "BHC", "공차", "빽다방", "더벤티"
    );

    // 섹션 경계 키워드(이 전까지만 제품명 후보로 탐색)
    private static final String[] SECTION_BOUNDARY_KEYS = {
            "유효기간", "교환처", "주문번호", "교환권", "교환만료", "바코드", "쿠폰번호", "발행일", "사용기간"
    };

    // 동의어 매핑 제거: 오직 이 목록의 "그대로 포함"만 브랜드로 인정
    private static final List<String> KNOWN_BRANDS = List.of(
            "스타벅스", "메가박스", "CGV", "롯데시네마", "이디야커피",
            "메가MGC커피", "크리스피크림", "파리바게뜨", "배스킨라빈스", "올리브영",
            "던킨", "맥도날드", "버거킹", "롯데리아", "투썸플레이스",
            "할리스", "교촌치킨", "BBQ", "BHC", "공차", "빽다방", "더벤티"
    );

    public record Result(String brand, String label, LocalDate expiresAt) {}

    public static Result parse(String text) {
        String[] lines = Arrays.stream(text.split("\\R"))
                .map(s -> s.replaceAll("\\s+", " ").trim())
                .filter(s -> !s.isBlank())
                .toArray(String[]::new);

        String brand = findBrand(lines);
        LocalDate exp = findExpiry(text);
        String label = findLabel(lines, brand);

        return new Result(brand, label, exp);
    }

    private static String findBrand(String[] lines) {
        // KNOWN_BRANDS 중 하나가 "포함"된 라인만 인정
        for (String ln : lines) {
            for (String b : KNOWN_BRANDS) {
                if (ln.contains(b)) return b;
            }
        }
        return null;
    }

    private static LocalDate findExpiry(String text) {
        Matcher m = DATE_PATTERN.matcher(text.replaceAll("\\s+", ""));
        if (m.find()) {
            int y = Integer.parseInt(m.group(1));
            int mo = Integer.parseInt(m.group(2));
            int d = Integer.parseInt(m.group(3));
            try { return LocalDate.of(y, mo, d); } catch (Exception ignored) {}
        }
        return null;
    }

    private static String findLabel(String[] lines, String brand) {
        // 1) 탐색 시작 위치: 브랜드 다음 줄부터
        int startIdx = 0;
        if (brand != null) {
            for (int i = 0; i < lines.length; i++) {
                if (lines[i].contains(brand)) { startIdx = i + 1; break; }
            }
        }

        // 2) 탐색 종료 위치: 섹션 경계 전까지
        int endIdx = lines.length;
        outer:
        for (int i = startIdx; i < lines.length; i++) {
            for (String key : SECTION_BOUNDARY_KEYS) {
                if (lines[i].contains(key)) { endIdx = i; break outer; }
            }
        }

        String bestKorean = null;   // 한글 포함 문장 중 가장 긴 것(최우선)
        String bestFallback = null; // 한글 후보 없으면 대비용(가장 긴 문장)

        for (int i = startIdx; i < endIdx; i++) {
            String ln = lines[i];
            if (ln.length() < 2) continue;

            String n = norm(ln);
            // "브랜드명만 적힌 라인" 또는 바코드 유사 라인은 제외
            if (NOISE_TOKENS.contains(n)) continue;
            if (BARCODE_LIKE.matcher(n).find()) continue;

            boolean hasKorean = KOREAN.matcher(ln).find();

            if (hasKorean) {
                if (bestKorean == null || ln.length() > bestKorean.length()) bestKorean = ln;
            } else {
                if (bestFallback == null || ln.length() > bestFallback.length()) bestFallback = ln;
            }
        }

        return bestKorean != null ? bestKorean : bestFallback;
    }
}
