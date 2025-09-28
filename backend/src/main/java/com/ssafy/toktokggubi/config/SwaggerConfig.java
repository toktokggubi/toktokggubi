package com.ssafy.toktokggubi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    public static final String ACCESS = "bearerAuth";
    public static final String SIGNUP = "signupAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("/").description("http://localhost:8080/"),
                        new Server().url("/api").description("http://j13b207.p.ssafy.io/api/")
                ))
                .info(new Info().title("TokTokGGUBI API").version("v1"))
                .components(new Components()
                        .addSecuritySchemes(ACCESS, new SecurityScheme()
                                .name(ACCESS).type(SecurityScheme.Type.HTTP)
                                .scheme("bearer").bearerFormat("JWT"))
                        .addSecuritySchemes(SIGNUP, new SecurityScheme()
                                .name(SIGNUP).type(SecurityScheme.Type.HTTP)
                                .scheme("bearer").bearerFormat("JWT"))
                )
                .addSecurityItem(new SecurityRequirement().addList(ACCESS));
    }
}
