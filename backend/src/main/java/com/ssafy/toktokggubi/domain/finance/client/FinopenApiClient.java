package com.ssafy.toktokggubi.domain.finance.client;

import com.ssafy.toktokggubi.domain.finance.dto.request.FinMemberRequest;
import com.ssafy.toktokggubi.domain.finance.dto.response.FinMemberResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FinopenApiClient {
    private final RestTemplate finopenRestTemplate;

    @Value("${finance.api.base-url}")
    private String baseUrl;

    @Value("${finance.api.key}")
    private String apiKey;

    public Optional<FinMemberResponse> search(String email) {
        String url = baseUrl + "/member/search";
        FinMemberRequest req = new FinMemberRequest(apiKey, email);
        try {
            ResponseEntity<FinMemberResponse> res =
                    finopenRestTemplate.postForEntity(url, req, FinMemberResponse.class);
            return Optional.ofNullable(res.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        }
    }

    public FinMemberResponse create(String email) {
        String url = baseUrl + "/member";
        FinMemberRequest req = new FinMemberRequest(apiKey, email);
        ResponseEntity<FinMemberResponse> res =
                finopenRestTemplate.postForEntity(url, req, FinMemberResponse.class);
        FinMemberResponse body = res.getBody();
        if (body == null || body.userKey() == null || body.userKey().isBlank()) {
            throw new IllegalStateException("금융망 사용자 생성 실패: userKey가 비어있습니다.");
        }
        return body;
    }
}
