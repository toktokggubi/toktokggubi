package com.ssafy.toktokggubi.domain.report.support;


import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class CategoryKeyMapper {
    // ID 순서 보장(LinkedHashMap)
    private static final Map<Long, String> MAP = new LinkedHashMap<>();

    static {
        MAP.put(1L, "food");
        MAP.put(2L, "cafe");
        MAP.put(3L, "nightlife");
        MAP.put(4L, "life");
        MAP.put(5L, "shopping");
        MAP.put(6L, "cosmetic");
        MAP.put(7L, "transportation");
        MAP.put(8L, "car");
        MAP.put(9L, "medical");
        MAP.put(10L, "entertainment");
        MAP.put(11L, "etc");
    }

    private CategoryKeyMapper() {
    }

    public static List<Long> orderedCategoryIds() {
        return MAP.keySet().stream().toList();
    }

    public static String keyOf(long categoryId) {
        return MAP.getOrDefault(categoryId, "etc"); // 안전망
    }

    public static Map<String, Long> emptyBudgetPreset() {
        Map<String, Long> m = new LinkedHashMap<>();
        // total은 별도로 채움
        for (var e : MAP.entrySet()) m.put(e.getValue(), -1L); // 미설정은 -1
        return m;
    }

    public static Map<String, Long> emptyActualPreset() {
        Map<String, Long> m = new LinkedHashMap<>();
        // total은 별도로 채움
        for (var e : MAP.entrySet()) m.put(e.getValue(), 0L);  // 미존재는 0
        return m;
    }
}
