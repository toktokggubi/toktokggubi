//package com.ssafy.toktokggubi.config;
//
//import com.openai.OpenAI;
//import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class GmsConfig {
//
//    @Bean
//    @ConditionalOnProperty(name = "gms.enabled", havingValue = "true", matchIfMissing = true)
//    public OpenAI openAI(@Value("${gms.api.key}") String apiKey) {
//        return OpenAI.builder()
//                .apiKey(apiKey)
//                .build();
//    }
//}
