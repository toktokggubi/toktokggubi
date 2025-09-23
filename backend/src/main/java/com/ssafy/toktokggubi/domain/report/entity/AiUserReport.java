package com.ssafy.toktokggubi.domain.report.entity;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Builder
@Document(collection = "ai_user_report")
public class AiUserReport {
    @Id
    private String id;
    private Long userId;
    private String username;
    private String overall_summary;
    private List<String> anomalies;
    private String adjustment;
    private int year;
    private int month;
}
