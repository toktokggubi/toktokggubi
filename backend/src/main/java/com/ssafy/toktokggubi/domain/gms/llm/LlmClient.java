package com.ssafy.toktokggubi.domain.gms.llm;

public interface LlmClient {
    String complete(String prompt, int maxTokens, double temperature);
}
