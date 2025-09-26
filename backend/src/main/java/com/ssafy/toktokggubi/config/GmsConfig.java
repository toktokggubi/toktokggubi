package com.ssafy.toktokggubi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import io.netty.channel.ChannelOption;
import java.time.Duration;

@Configuration
public class GmsConfig {
    @Bean
    WebClient gmsWebClient(
            @Value("${gms.llm.base-url}") String baseUrl,
            @Value("${gms.llm.timeout.ms:5000}") long ms
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create()
                                .responseTimeout(Duration.ofMillis(ms))
                                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) ms)
                ))
                .build();
    }
}
