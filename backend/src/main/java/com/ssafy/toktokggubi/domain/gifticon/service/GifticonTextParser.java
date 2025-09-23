package com.ssafy.toktokggubi.domain.gifticon.service;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * OCR 텍스트에서 브랜드/라벨/유효기간을 추출한다.
 * - 브랜드: 정규화/동의어/오인식 교정 + "교환처" 라인(다음 줄 포함) 우선
 *          → 사전 매핑 실패 시 원문을 그대로 브랜드로 폴백
 *          → 추가로 본문에서 짧고(≤15) 반복(≥2)되는 토큰을 브랜드로 폴백
 * - 라벨: 브랜드 이후 ~ 섹션 경계 전까지, 브랜드명/로고/바코드 제거, 상품권/교환권 가중치
 * - 유효기간: YYYY.MM.DD / YYYY-MM-DD / YYYY년 MM월 DD일 등
 */
public class GifticonTextParser {

    /* ========================= 유틸/정규식 ========================= */

    private static String normTight(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("\\s+", "");
    }

    /** 화면용으로 과한 기호/공백을 정리하고 너무 긴 문장은 잘라준다 */
    private static String cleanDisplay(String raw) {
        if (raw == null) return null;
        String s = raw.replaceAll("^[^A-Za-z0-9가-힣]+|[^A-Za-z0-9가-힣]+$", "");
        s = s.replaceAll("\\s+", " ").trim();
        if (s.length() > 30) s = s.substring(0, 30);
        return s.isBlank() ? null : s;
    }

    /** 브랜드 매칭을 위해 사전 정규화(소문자+특수문자 제거+오인식 보정) */
    private static String normalizeBrandToken(String s) {
        if (s == null) return "";
        String t = s.toLowerCase();
        t = t.replaceAll("[^a-z0-9가-힣]", "");
        // 흔한 OCR 오인식 보정
        t = t.replace("gs2s", "gs25"); // 2↔5
        t = t.replace("g525", "gs25");
        t = t.replace("g5s", "gs");
        t = t.replace("c u", "cu");
        return t;
    }

    private static final Pattern KOREAN = Pattern.compile("[가-힣]");
    private static final Pattern BARCODE_LIKE = Pattern.compile("\\d{10,}");
    private static final Pattern DATE_PATTERN = Pattern.compile("(20\\d{2})[./년\\- ]\\s*(\\d{1,2})[./월\\- ]\\s*(\\d{1,2})");

    // "교환처: XXX"
    private static final Pattern EXCHANGE_BRAND = Pattern.compile("교환처\\s*[:：]?\\s*([A-Za-z0-9가-힣 ]{2,})");

    // 섹션 경계 키워드(이 전까지만 제품명 후보)
    private static final String[] SECTION_BOUNDARY_KEYS = {
            "유효기간", "교환처", "주문번호", "교환권", "교환만료", "바코드", "쿠폰번호", "발행일", "사용기간"
    };

    /* ========================= 브랜드 캐노니컬/동의어 ========================= */

    // 캐노니컬 키 → 표시 이름(merchant_name과 동일)
    private static final Map<String, String> CANONICAL = new HashMap<>() {{
        put("스타벅스", "스타벅스");
        put("메가박스", "메가박스");
        put("파리바게뜨", "파리바게뜨");
        put("이디야커피", "이디야커피");
        put("cgv", "CGV");
        put("롯데시네마", "롯데시네마");
        put("맥도날드", "맥도날드");
        put("롯데리아", "롯데리아");
        put("교촌치킨", "교촌치킨");
        put("올리브영", "올리브영");
        put("메가mgc커피", "메가MGC커피"); // 정규화 키(소문자/공백제거)
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
        put("배달의민족", "배달의민족");   // 브랜드명 그대로 프랜차이즈
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

        // 영어 인식 대비
        put("starbucks", "스타벅스");
        put("megabox", "메가박스");
        put("baemin", "배달의민족");
    }};

    // 다양한 입력(동의어/오인식/한글표기) → 캐노니컬 키
    private static final Map<String, String> BRAND_ALIASES = new HashMap<>() {{
        // 짧은 영문/숫자(오인식多)
        put("cu", "cu");
        put("씨유", "cu");
        put("c u", "cu");
        put("gs25", "gs25");
        put("gs 25", "gs25");
        put("지에스25", "gs25");
        put("gs2s", "gs25");
        put("g525", "gs25");
        put("cgv", "cgv");
        put("kfc", "kfc");
        put("bhc", "bhc");
        put("bbq", "bbq");
        put("srt", "srt");

        // 배달의민족(브랜드)
        put("배달의민족", "배달의민족");
        put("배민", "배달의민족");
        put("baemin", "배달의민족");

        // 우아한형제들(기업명은 별도 프랜차이즈)
        put("우아한형제들", "우아한형제들");

        // 한/영 혼용
        put("starbucks", "스타벅스");
        put("스타벅스", "스타벅스");
        put("megabox", "메가박스");
        put("메가박스", "메가박스");

        // 한글 브랜드
        put("파리바게뜨", "파리바게뜨");
        put("이디야커피", "이디야커피");
        put("롯데시네마", "롯데시네마");
        put("맥도날드", "맥도날드");
        put("롯데리아", "롯데리아");
        put("교촌치킨", "교촌치킨");
        put("올리브영", "올리브영");
        put("크리스피크림", "크리스피크림");
        put("배스킨라빈스", "배스킨라빈스");
        put("버거킹", "버거킹");
        put("세븐일레븐", "세븐일레븐");
        put("이마트24", "이마트24");
        put("투썸플레이스", "투썸플레이스");
        put("컴포즈커피", "컴포즈커피");
        put("맘스터치", "맘스터치");
        put("굽네치킨", "굽네치킨");
        put("파스쿠찌", "파스쿠찌");
        put("엔제리너스", "엔제리너스");
        put("한솥도시락", "한솥도시락");
        put("쿠팡", "쿠팡");
        put("할리스", "할리스");
        put("공차", "공차");
        put("탐앤탐스", "탐앤탐스");
        put("성심당", "성심당");
        put("아웃백", "아웃백");
        put("본죽", "본죽");
        put("이케아", "이케아");
        put("nc백화점", "nc백화점");
        put("티머니", "티머니");
        put("마이비", "마이비");
        put("이비", "이비");
        put("한국철도공사", "한국철도공사");
        put("코레일유통", "코레일유통");

        // 메가MGC 커피 변형
        put("메가mgc커피", "메가mgc커피");
        put("메가 mgc 커피", "메가mgc커피");
        put("mega mgc coffee", "메가mgc커피");
        put("megamingccoffee", "메가mgc커피");
    }};

    // 라벨 노이즈 토큰(브랜드명은 모두 자동 포함)
    private static final Set<String> NOISE_TOKENS = new HashSet<>();
    static {
        NOISE_TOKENS.addAll(List.of("br","baskin","robbins","coupon","kakaotalk","선물하기","bbg"));
        for (String display : CANONICAL.values()) {
            NOISE_TOKENS.add(normTight(display));
        }
        NOISE_TOKENS.addAll(List.of("cu","gs25","cgv"));
        NOISE_TOKENS.add(normTight("mgc"));
        NOISE_TOKENS.add(normTight("paiks"));
        NOISE_TOKENS.add("cocacola");
        NOISE_TOKENS.add("pepsi");
        NOISE_TOKENS.add("sprite");
        NOISE_TOKENS.add("fanta");
    }

    /* ========================= 공개 API ========================= */

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

    /* ========================= 브랜드 추출 ========================= */

    /** 캐노니컬/별칭으로 정규화 시도 */
    private static String canonicalize(String normalizedKey) {
        String k = normalizedKey;
        if (BRAND_ALIASES.containsKey(k)) k = BRAND_ALIASES.get(k);
        return CANONICAL.getOrDefault(k, null);
    }

    /** "교환처" 라인에서 브랜드 추출: 매핑 실패 시 원문으로 폴백 */
    private static String tryFromExchangeLine(String[] lines) {
        for (int i = 0; i < lines.length; i++) {
            String cur = lines[i].replaceAll("\\s+", " ").trim();

            // 같은 줄: "교환처: XXX"
            var m = EXCHANGE_BRAND.matcher(cur);
            if (m.find()) {
                String raw = cleanDisplay(m.group(1));
                String nk  = normalizeBrandToken(raw);
                String canon = canonicalize(nk);
                return canon != null ? canon : raw; // ★ 폴백
            }

            // 다음 줄: "교환처" \n "XXX"
            if (cur.equals("교환처") && i + 1 < lines.length) {
                String raw = cleanDisplay(lines[i + 1]);
                String nk  = normalizeBrandToken(raw);
                String canon = canonicalize(nk);
                return canon != null ? canon : raw; // ★ 폴백
            }
        }
        return null;
    }

    /** 본문 스캔: 매핑 → 실패 시 반복 토큰 폴백 */
    private static String tryFromWholeText(String[] lines) {
        // 1) 사전 매핑 우선
        for (String ln : lines) {
            String nk = normalizeBrandToken(ln);
            for (String alias : BRAND_ALIASES.keySet()) {
                String ak = normalizeBrandToken(alias);
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

        // 2) 폴백: 짧고(≤15), 노이즈/바코드 아님, 2회 이상 등장하는 토큰
        Map<String, Integer> count = new LinkedHashMap<>();
        for (String ln : lines) {
            String disp = cleanDisplay(ln);
            if (disp == null) continue;
            String tight = normTight(disp);
            if (tight.length() < 2 || tight.length() > 15) continue;
            if (NOISE_TOKENS.contains(tight)) continue;
            if (BARCODE_LIKE.matcher(tight).find()) continue;
            if (!tight.matches("[a-z0-9가-힣]+")) continue; // 알파뉴메릭/한글만
            count.put(disp, count.getOrDefault(disp, 0) + 1);
        }
        for (var e : count.entrySet()) {
            if (e.getValue() >= 2) return e.getKey(); // ★ 폴백 브랜드
        }
        return null;
    }

    private static String findBrand(String[] lines) {
        String byExchange = tryFromExchangeLine(lines);
        if (byExchange != null) return byExchange;

        String byScan = tryFromWholeText(lines);
        if (byScan != null) return byScan;

        // 마지막 안전장치(매우 느슨)
        for (String ln : lines) {
            String nk = normalizeBrandToken(ln);
            for (String entry : CANONICAL.keySet()) {
                if (nk.contains(entry)) return CANONICAL.get(entry);
            }
        }
        return null;
    }

    /* ========================= 유효기간/라벨 ========================= */

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

    private static boolean isBoundaryLine(String s) {
        for (String key : SECTION_BOUNDARY_KEYS) {
            if (s.contains(key)) return true;
        }
        return false;
    }

    private static boolean isBarcodeLike(String tight) {
        return BARCODE_LIKE.matcher(tight).find();
    }

    private static boolean isNoise(String tight) {
        return NOISE_TOKENS.contains(tight);
    }

    /** 다음 줄과 이어서 붙여야 할지 휴리스틱 */
    private static boolean shouldJoin(String curr, String next) {
        if (next == null || next.isBlank()) return false;

        // 1) 현재 줄이 이어짐 기호로 끝남
        String c = curr.trim();
        if (c.endsWith("+") || c.endsWith(",") || c.endsWith("·") || c.endsWith("/") || c.endsWith("("))
            return true;

        // 2) 괄호가 아직 안 닫힘
        long open = c.chars().filter(ch -> ch=='(').count();
        long close = c.chars().filter(ch -> ch==')').count();
        if (open > close) return true;

        // 3) 다음 줄이 괄호로 시작하거나 소문자/한글로 자연스럽게 이어짐
        String n = next.trim();
        if (n.startsWith("(")) return true;
        if (!n.isEmpty()) {
            char ch = n.charAt(0);
            if ((ch >= 'a' && ch <= 'z') || KOREAN.matcher(Character.toString(ch)).find()) return true;
        }
        return false;
    }

    /** 라벨 추출(최대 3줄까지 이어붙임) */
    private static String findLabel(String[] lines, String brand) {
        int startIdx = 0;
        if (brand != null) {
            for (int i = 0; i < lines.length; i++) {
                if (lines[i].contains(brand)) { startIdx = i + 1; break; }
            }
        }

        int endIdx = lines.length;
        outer:
        for (int i = startIdx; i < lines.length; i++) {
            for (String key : SECTION_BOUNDARY_KEYS) {
                if (lines[i].contains(key)) { endIdx = i; break outer; }
            }
        }

        final Set<String> labelHints = Set.of("상품권", "교환권", "세트", "세트메뉴", "쿠폰", "기프트");
        String best = null;
        int bestScore = Integer.MIN_VALUE;

        for (int i = startIdx; i < endIdx; i++) {
            String ln = lines[i];
            if (ln.length() < 2) continue;

            String tight = normTight(ln);
            if (isBoundaryLine(ln) || isNoise(tight) || isBarcodeLike(tight)) continue;

            boolean hasKoreanCurr = KOREAN.matcher(ln).find();

            // 현재 줄에 한글이 없고, 다음 줄에는 한글이 있으면 현재 줄은 로고/장식으로 간주하여 스킵
            if (!hasKoreanCurr && i + 1 < endIdx) {
                String next = lines[i + 1];
                String nextTight = normTight(next);
                if (next.length() >= 2 && !isBoundaryLine(next) && !isNoise(nextTight) && !isBarcodeLike(nextTight)
                        && KOREAN.matcher(next).find()) {
                    continue; // Coca-Cola 같은 로고 라인은 건너뛴다
                }
            }

            // ----- 이어붙이기: 최대 2줄을 추가(총 3줄) -----
            String merged = ln.trim();
            int j = i;
            for (int joinCount = 0; joinCount < 2; joinCount++) {
                int nextIdx = j + 1;
                if (nextIdx >= endIdx) break;
                String next = lines[nextIdx];
                String nextTight = normTight(next);
                if (next.length() < 2) break;
                if (isBoundaryLine(next) || isNoise(nextTight) || isBarcodeLike(nextTight)) break;

                if (!shouldJoin(merged, next)) break;

                merged = (merged + " " + next).replaceAll("\\s+", " ").trim();
                j = nextIdx;
            }

            // ----- 점수 계산 -----
            boolean hasKorean = KOREAN.matcher(merged).find();
            int score = 0;
            if (hasKorean) score += 2;
            for (String h : labelHints) {
                if (merged.contains(h)) { score += 3; break; }
            }
            score += Math.min(merged.length(), 60) / 4; // 길이 가중(조금 상향)

            if (score > bestScore) {
                bestScore = score;
                best = merged;
            }
        }
        return best;
    }
}
