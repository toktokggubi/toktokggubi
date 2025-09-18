package com.ssafy.toktokggubi.domain.gifticon.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.*;

public class GifticonTextParser {

    private static final List<String> KNOWN_BRANDS = List.of(
            "스타벅스", "메가박스", "CGV", "롯데시네마", "이디야커피",
            "메가MGC커피","크리스피크림","파리바게뜨", "배스킨라빈스", "올리브영",
            "이디야커피","던킨","맥도날드","버거킹","롯데리아",
            "투썸플레이스","할리스","교촌치킨","BBQ","BHC"
    );

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("yyyy.MM.dd"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),
            DateTimeFormatter.ofPattern("yyyy년 M월 d일")
    );

    // yyyy.MM.dd / yyyy년 M월 d일 등 검색
    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(20\\d{2})[./년\\- ]\\s*(\\d{1,2})[./월\\- ]\\s*(\\d{1,2})");

    public static Result parse(String text) {
        String[] lines = Arrays.stream(text.split("\\R"))
                .map(s -> s.replaceAll("\\s+", " ").trim())
                .filter(s -> !s.isBlank())
                .toArray(String[]::new);

        String brand = findBrand(lines, text);
        LocalDate exp = findExpiry(text);
        String label = findLabel(lines, brand);

        return new Result(brand, label, exp);
    }

    private static String findBrand(String[] lines, String text) {
        // 1) 사전 브랜드 키워드 포함 라인
        for (String b : KNOWN_BRANDS) {
            for (String ln : lines) {
                if (ln.contains(b)) return b;
            }
        }
        // 2) 맨 위 굵게 인식되는 첫 라인을 브랜드로 추정
        return lines.length > 0 ? lines[0] : null;
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
        // 브랜드 라인 다음에 오는 가장 긴 문장을 제품명으로 추정
        boolean brandPassed = (brand == null); // 브랜드를 못 찾으면 첫 줄부터 탐색
        String best = null;
        for (String ln : lines) {
            if (!brandPassed) {
                if (ln.contains(brand)) brandPassed = true;
                continue;
            }
            if (ln.length() >= 6 && !ln.matches(".*\\d{10,}.*")) { // 바코드라인 배제
                best = ln;
                break;
            }
        }
        return best;
    }

    public record Result(String brand, String label, LocalDate expiresAt) {}
}
