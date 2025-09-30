package com.ssafy.toktokggubi.domain.gifticon.service;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GifticonTextParser {

    /* ============ 공통 유틸/정규식 ============ */

    private static final Pattern KOREAN = Pattern.compile("[가-힣]");
    private static final Pattern BARCODE_LIKE = Pattern.compile("\\d{10,}");
    private static final Pattern DATE_PATTERN = Pattern.compile("(20\\d{2})[./년\\- ]\\s*(\\d{1,2})[./월\\- ]\\s*(\\d{1,2})");
    private static final Pattern EXCHANGE_BRAND = Pattern.compile("교환처\\s*[:：]?\\s*([A-Za-z0-9가-힣 ()\\-]{2,})");
    private static final List<String> SECTION_KEYS = List.of(
            "유효기간", "교환처", "주문번호", "교환권", "바코드", "쿠폰번호", "발행일", "사용기간", "유효", "만료"
    );
    private static final Set<String> FORBIDDEN_BRAND = new HashSet<>(List.of(
            "유효기간", "교환처", "주문번호", "교환권", "상품권", "쿠폰", "쿠폰번호", "kakaotalk", "선물하기",
            "barcode", "바코드", "thegoldenexperience"
    ));
    private static final Set<String> LOGO_TOKENS = new HashSet<>(List.of(
            "cocacola", "coca", "cola", "pepsi", "sprite", "fanta",
            "gongcha", "gong", "cha",
            "ferrerorocher", "rocher", "ferrero", "mgc", "paiks", "bbg"
    ));
    private static final Map<String, String> CANONICAL = new HashMap<>() {{
        put("스타벅스", "스타벅스");
        put("megabox", "메가박스");
        put("메가박스", "메가박스");
        put("파리바게뜨", "파리바게뜨");
        put("이디야커피", "이디야커피");
        put("cgv", "CGV");
        put("롯데시네마", "롯데시네마");
        put("맥도날드", "맥도날드");
        put("롯데리아", "롯데리아");
        put("교촌치킨", "교촌치킨");
        put("올리브영", "올리브영");
        put("메가mgc커피", "메가MGC커피");
        put("크리스피크림", "크리스피크림");
        put("배스킨라빈스", "배스킨라빈스");
        put("버거킹", "버거킹");
        put("세븐일레븐", "세븐일레븐");
        put("gs25", "GS25");
        put("cu", "CU");
        put("이마트24", "이마트24");
        put("투썸플레이스", "투썸플레이스");
        put("컴포즈커피", "컴포즈커피");
        put("맘스터치", "맘스터치");
        put("굽네치킨", "굽네치킨");
        put("파스쿠찌", "파스쿠찌");
        put("엔제리너스", "엔제리너스");
        put("kfc", "KFC");
        put("한솥도시락", "한솥도시락");
        put("bhc", "BHC");
        put("bbq", "BBQ");
        put("쿠팡", "쿠팡");
        put("배달의민족", "배달의민족");
        put("baemin", "배달의민족");
        put("우아한형제들", "우아한형제들");
        put("할리스", "할리스");
        put("공차", "공차");
        put("탐앤탐스", "탐앤탐스");
        put("성심당", "성심당");
        put("아웃백", "아웃백");
        put("본죽", "본죽");
        put("이케아", "이케아");
        put("nc백화점", "NC백화점");
        put("티머니", "티머니");
        put("마이비", "마이비");
        put("이비", "이비");
        put("한국철도공사", "한국철도공사");
        put("코레일유통", "코레일유통");
        put("srt", "SRT");
        put("starbucks", "스타벅스");
    }};

    /* ============ 금지/로고/노이즈 ============ */
    private static final Map<String, String> ALIASES = new HashMap<>() {{
        put("씨유", "cu");
        put("c u", "cu");
        put("gs 25", "gs25");
        put("지에스25", "gs25");
        put("gs2s", "gs25");
        put("g525", "gs25");
        put("메가 mgc 커피", "메가mgc커피");
        put("mega mgc coffee", "메가mgc커피");
        put("megamingccoffee", "메가mgc커피");
        put("배민", "배달의민족");
        put("baemin", "baemin");
    }};
    /**
     * 라벨에서 전역으로 제외할 “브랜드명 자체”(표시 이름)의 tight 집합
     */
    private static final Set<String> BRAND_NAME_TIGHT = new HashSet<>();

    /* ============ 브랜드 사전 ============ */

    static {
        for (String display : CANONICAL.values()) BRAND_NAME_TIGHT.add(tight(display));
        // 흔한 영문 표기(로고)
        BRAND_NAME_TIGHT.add("gongcha");
    }

    private static String tight(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("\\s+", "");
    }

    private static String cleanDisplay(String raw) {
        if (raw == null) return null;
        String s = raw.replaceAll("^[^A-Za-z0-9가-힣]+|[^A-Za-z0-9가-힣]+$", "");
        s = s.replaceAll("\\s+", " ").trim();
        if (s.length() > 60) s = s.substring(0, 60);
        return s.isBlank() ? null : s;
    }

    private static String normBrandKey(String s) {
        if (s == null) return "";
        String t = s.toLowerCase().replaceAll("[^a-z0-9가-힣]", "");
        t = t.replace("gs2s", "gs25");
        t = t.replace("g525", "gs25");
        t = t.replace("g5s", "gs");
        t = t.replace("c u", "cu");
        return t;
    }

    /* ============ 공개 API ============ */

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

    private static String canonicalize(String keyNorm) {
        String k = keyNorm;
        if (ALIASES.containsKey(k)) k = ALIASES.get(k);
        return CANONICAL.getOrDefault(k, null);
    }

    /* ============ 브랜드 ============ */

    private static String brandFromExchangeSection(String[] lines) {
        for (int i = 0; i < lines.length; i++) {
            String cur = lines[i].replaceAll("\\s+", " ").trim();

            Matcher m = EXCHANGE_BRAND.matcher(cur);
            if (m.find()) {
                String raw = cleanDisplay(m.group(1));
                if (raw == null) continue;
                String key = normBrandKey(raw);
                if (FORBIDDEN_BRAND.contains(raw) || FORBIDDEN_BRAND.contains(key)) continue;
                String canon = canonicalize(key);
                return (canon != null) ? canon : raw;
            }

            if (cur.equals("교환처")) {
                for (int j = 1; j <= 2 && i + j < lines.length; j++) {
                    String raw = cleanDisplay(lines[i + j]);
                    if (raw == null) continue;
                    String key = normBrandKey(raw);
                    if (FORBIDDEN_BRAND.contains(raw) || FORBIDDEN_BRAND.contains(key)) continue;
                    String canon = canonicalize(key);
                    return (canon != null) ? canon : raw;
                }
            }
        }
        return null;
    }

    private static String brandFromHeaderOrFrequency(String[] lines) {
        int header = Math.min(6, lines.length);
        for (int pass = 0; pass < 2; pass++) {
            int to = (pass == 0 ? header : lines.length);
            for (int i = 0; i < to; i++) {
                String nk = normBrandKey(lines[i]);
                for (String alias : ALIASES.keySet()) {
                    String ak = normBrandKey(alias);
                    if (!ak.isEmpty() && nk.contains(ak)) {
                        String canon = canonicalize(ak);
                        if (canon != null) return canon;
                    }
                }
                for (String key : CANONICAL.keySet()) {
                    if (!key.isEmpty() && nk.contains(key)) {
                        return CANONICAL.get(key);
                    }
                }
            }
        }
        Map<String, Integer> counter = new LinkedHashMap<>();
        for (String ln : lines) {
            String disp = cleanDisplay(ln);
            if (disp == null) continue;
            String tk = tight(disp);
            if (tk.length() < 2 || tk.length() > 15) continue;
            if (!tk.matches("[a-z0-9가-힣]+")) continue;
            if (FORBIDDEN_BRAND.contains(disp) || FORBIDDEN_BRAND.contains(tk)) continue;
            if (LOGO_TOKENS.contains(tk)) continue;
            if (BARCODE_LIKE.matcher(tk).find()) continue;
            counter.put(disp, counter.getOrDefault(disp, 0) + 1);
        }
        for (var e : counter.entrySet()) {
            if (e.getValue() >= 2) return e.getKey();
        }
        return null;
    }

    private static String findBrand(String[] lines) {
        String b = brandFromExchangeSection(lines);
        if (b != null) return b;
        return brandFromHeaderOrFrequency(lines);
    }

    private static LocalDate findExpiry(String text) {
        Matcher m = DATE_PATTERN.matcher(text.replaceAll("\\s+", ""));
        if (m.find()) {
            int y = Integer.parseInt(m.group(1));
            int mo = Integer.parseInt(m.group(2));
            int d = Integer.parseInt(m.group(3));
            try {
                return LocalDate.of(y, mo, d);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    /* ============ 만료일 ============ */

    private static boolean isSectionLine(String s) {
        for (String k : SECTION_KEYS) if (s.contains(k)) return true;
        return false;
    }

    /* ============ 라벨 ============ */

    private static boolean isBarcodeLike(String tk) {
        return BARCODE_LIKE.matcher(tk).find();
    }

    private static boolean isLogoOrNoise(String tk) {
        return LOGO_TOKENS.contains(tk) || FORBIDDEN_BRAND.contains(tk);
    }

    private static boolean isBrandNameLine(String s) {
        return BRAND_NAME_TIGHT.contains(tight(s));
    }

    private static boolean shouldJoin(String curr, String next) {
        if (next == null || next.isBlank()) return false;
        String c = curr.trim();
        if (c.endsWith("+") || c.endsWith(",") || c.endsWith("·") || c.endsWith("/") || c.endsWith("(")) return true;
        long open = c.chars().filter(ch -> ch == '(').count();
        long close = c.chars().filter(ch -> ch == ')').count();
        if (open > close) return true;
        String n = next.trim();
        if (n.startsWith("(")) return true;
        if (!n.isEmpty()) {
            char ch = n.charAt(0);
            return (ch >= 'a' && ch <= 'z') || KOREAN.matcher(Character.toString(ch)).find();
        }
        return false;
    }

    private static String findLabel(String[] lines, String brand) {
        // 1) 첫 섹션 경계 위치
        int firstBoundary = lines.length;
        for (int i = 0; i < lines.length; i++) {
            if (isSectionLine(lines[i])) {
                firstBoundary = i;
                break;
            }
        }

        // 2) 라벨 탐색 시작: “경계 이전”에 나타난 첫 브랜드 다음 줄
        int start = 0;
        if (brand != null) {
            for (int i = 0; i < Math.min(firstBoundary, lines.length); i++) {
                if (lines[i].contains(brand)) {
                    start = i + 1;
                    break;
                }
            }
        }

        // 3) 라벨 탐색 종료: 첫 섹션 경계
        int end = firstBoundary;

        // 4) 스코어링
        final Set<String> hints = Set.of("상품권", "교환권", "세트", "세트메뉴", "쿠폰", "기프트", "ml", "ML", "L", "개", "oz");

        String best = null;
        int bestScore = Integer.MIN_VALUE;

        for (int i = start; i < end; i++) {
            String line = lines[i];
            if (line.length() < 2) continue;

            String tk = tight(line);
            if (isBrandNameLine(line)) continue;          // ★ 브랜드명 자체 배제
            if (isSectionLine(line) || isBarcodeLike(tk) || isLogoOrNoise(tk)) continue;

            boolean hasKoCurr = KOREAN.matcher(line).find();
            if (!hasKoCurr && i + 1 < end) {
                String nxt = lines[i + 1];
                String nxtTk = tight(nxt);
                if (nxt.length() >= 2 && !isSectionLine(nxt) && !isBrandNameLine(nxt)
                        && !isLogoOrNoise(nxtTk) && !isBarcodeLike(nxtTk)
                        && KOREAN.matcher(nxt).find()) {
                    continue; // 영문 로고 라인 스킵
                }
            }

            String merged = line.trim();
            int j = i;
            for (int join = 0; join < 2; join++) {
                int ni = j + 1;
                if (ni >= end) break;
                String next = lines[ni];
                String nextTk = tight(next);
                if (next.length() < 2) break;
                if (isSectionLine(next) || isBrandNameLine(next) || isLogoOrNoise(nextTk) || isBarcodeLike(nextTk))
                    break;
                if (!shouldJoin(merged, next)) break;
                merged = (merged + " " + next).replaceAll("\\s+", " ").trim();
                j = ni;
            }

            int score = 0;
            if (KOREAN.matcher(merged).find()) score += 2;
            for (String h : hints) {
                if (merged.contains(h)) {
                    score += 3;
                    break;
                }
            }
            if (merged.matches(".*\\d+\\s?(?:ml|ML|L|개|oz).*")) score += 2;
            score += Math.min(merged.length(), 60) / 4;

            if (score > bestScore) {
                bestScore = score;
                best = merged;
            }
        }

        return cleanDisplay(best);
    }

    public record Result(String brand, String label, LocalDate expiresAt) {
    }
}
