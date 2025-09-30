package com.ssafy.toktokggubi.domain.gms.llm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GmsLlmClient implements LlmClient {

    private final WebClient gmsWebClient;

    @Value("${gms.llm.api-key}")
    String apiKey;
    @Value("${gms.llm.model}")
    String model;

    @Override
    public String complete(String prompt, int maxTokens, double temperature) {
        // OpenAI "Responses" 엔드포인트 규격:
        // POST /v1/responses
        // { "model": "...", "input": "...", "max_output_tokens": 80, "temperature": 0.9 }
        Map<String, Object> req = new java.util.HashMap<>();
        req.put("model", model);
        req.put("input", prompt);
        if (maxTokens > 0) req.put("max_output_tokens", maxTokens);
        req.put("temperature", temperature);

        return gmsWebClient.post()
                .uri("/responses")                                   // ★ 핵심: /responses
                .header("Authorization", "Bearer " + apiKey)          // ★ GMS 키를 Bearer 로
                .bodyValue(req)
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class)
                                .map(body -> new Resp(resp.statusCode(), body)))
                .map(r -> {
                    if (r.code.is2xxSuccessful()) {
                        // 응답 파싱 (Responses 포맷)
                        try {
                            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                            var node = mapper.readTree(r.body);
                            // text는 choices[0].message.content 와 유사하게 results[0].output_text 일 수 있음
                            // GMS 문서 예시는 단순 응답이라 아래처럼 시도:
                            var text = node.path("output_text").asText(null);
                            if (text == null || text.isBlank()) {
                                // 혹시 다른 필드로 내려오면 보조 파싱
                                var out = node.path("output").asText(null);
                                if (out != null && !out.isBlank()) return out;
                                // OpenAI responses의 표준 예: "output[0].content[0].text"
                                var outputArr = node.path("output");
                                if (outputArr.isArray() && outputArr.size() > 0) {
                                    var contentArr = outputArr.get(0).path("content");
                                    if (contentArr.isArray() && contentArr.size() > 0) {
                                        var t = contentArr.get(0).path("text").asText("");
                                        return t;
                                    }
                                }
                            }
                            return text != null ? text : "";
                        } catch (Exception e) {
                            // 형식 달라도 일단 바디 그대로 로그 후 빈 문자열 반환
                            log.warn("[GMS] parse responses failed body={}", r.body, e);
                            return "";
                        }
                    } else {
                        // 4xx/5xx 에러 바디를 그대로 로그
                        log.warn("[GMS] LLM call failed: status={} body={}", r.code.value(), r.body);
                        throw new IllegalStateException("GMS LLM error " + r.code.value());
                    }
                })
                .block();
    }

    private record Resp(org.springframework.http.HttpStatusCode code, String body) {
    }
}
