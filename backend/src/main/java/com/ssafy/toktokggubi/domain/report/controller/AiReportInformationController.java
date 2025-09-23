package com.ssafy.toktokggubi.domain.report.controller;

import com.ssafy.toktokggubi.domain.report.dto.request.AiReportInformationRequest;
import com.ssafy.toktokggubi.domain.report.dto.response.AiReportInformationResponse;
import com.ssafy.toktokggubi.domain.report.service.AiReportInformationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai/report")
@Tag(name = "AI월간리포트정보", description = "AI 월간 리포트 정보 제공 API")
public class AiReportInformationController {

    private final AiReportInformationService service;

    @PostMapping("/information")
    public AiReportInformationResponse getReportInformation(@RequestBody AiReportInformationRequest request) {
        return service.getInformation(request);
    }
}
