package com.ssafy.toktokggubi.domain.push.service;

import com.openai.client.OpenAIClient;
import com.openai.models.chat.ChatCompletionRequest;
import com.openai.models.chat.ChatCompletionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LlmMessageService {

    private final OpenAIClient openAiClient;

    public String generateMessage(String prompt) {
        ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-4o-mini")
                .messages(List.of(new ChatMessage("user", prompt)))
                .maxTokens(100)
                .build();

        ChatCompletionResponse response = openAiClient.chat().create(request);
        return response.getChoices().get(0).getMessage().getContent();
    }
}
