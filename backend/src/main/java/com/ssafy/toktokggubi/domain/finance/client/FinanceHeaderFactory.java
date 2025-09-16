package com.ssafy.toktokggubi.domain.finance.client;

import com.ssafy.toktokggubi.domain.finance.dto.request.FinanceHeaderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class FinanceHeaderFactory {
    @Value("${finance.api.key}") private String apiKey;
    @Value("${finance.api.institution-code:00100}") private String institutionCode;
    @Value("${finance.api.fintech-app-no:001}") private String fintechAppNo;

    public FinanceHeaderRequest build(String apiName, String userKey) {
        var now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        String d = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String t = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String uniq = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        return new FinanceHeaderRequest(
                apiName, d, t, institutionCode, fintechAppNo, apiName, uniq, apiKey, userKey
        );
    }
}
