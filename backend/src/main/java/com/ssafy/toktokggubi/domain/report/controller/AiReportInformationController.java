package com.ssafy.toktokggubi.domain.report.controller;

import com.ssafy.toktokggubi.domain.report.dto.request.AiReportInformationRequest;
import com.ssafy.toktokggubi.domain.report.dto.request.AiUserReportRequest;
import com.ssafy.toktokggubi.domain.report.dto.response.AiReportInformationResponse;
import com.ssafy.toktokggubi.domain.report.service.AiReportInformationService;
import com.ssafy.toktokggubi.domain.report.service.AiUserReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI 월간 리포트 정보 및 사용자 리포트 관련 API를 제공하는 컨트롤러.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/ai/report")
@Tag(name = "AI월간리포트", description = "AI 월간 리포트 정보 제공 API")
public class AiReportInformationController {

    private final AiReportInformationService service;
    private final AiUserReportService aiUserReportService;

    /**
     * AI 월간 리포트 정보를 조회합니다.
     * 예산 설정 및 실제 지출 내역을 포함한 월간 리포트 데이터를 반환합니다.
     *
     * @param request 사용자 ID, 닉네임, 조회할 년도 및 월을 포함하는 요청 객체
     * @return AI 월간 리포트 정보 응답 객체 (예산 설정 및 실제 지출 내역 포함)
     */
    @PostMapping("/information")
    @Operation(summary = "AI 예산, 지출 데이터 조회", description = "사용자의 월간 예산 설정 및 실제 지출 정보를 조회합니다.")
    public AiReportInformationResponse getReportInformation(@RequestBody AiReportInformationRequest request) {
        return service.getInformation(request);
    }

    /**
     * AI 사용자 리포트를 저장합니다.
     * AI 분석을 통해 생성된 사용자별 월간 리포트 데이터를 받아 저장합니다.
     *
     * TODO: request의 형태는 아직 확정이 아니어서 변경 될 수 있음.
     * @param request 사용자 ID, 닉네임, 전체 요약, 이상 징후, 조정 내용, 년도, 월을 포함하는 요청 객체
     * @return HTTP 상태 코드 201 (Created)
     */
    @PostMapping("/save")
    @Operation(summary = "AI 사용자 리포트 저장", description = "AI 분석을 통해 생성된 사용자별 월간 리포트 데이터를 저장합니다.")
    public ResponseEntity<Void> receiveAiUserReport(@RequestBody AiUserReportRequest request) {
        aiUserReportService.saveAiUserReport(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
