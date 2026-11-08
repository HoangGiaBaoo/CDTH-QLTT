package org.example.cdthqltt.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger UI (chỉ bật ở profile dev) kèm nút Authorize nhập JWT. */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI qlttOpenApi() {
        return new OpenAPI()
                .info(new Info().title("QLTT — Quản lý Thực tập tốt nghiệp HUCE").version("1.0"))
                .components(new Components().addSecuritySchemes("bearer",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearer"));
    }
}
