package com.ssafy.toktokggubi.domain.report.controller;

import com.ssafy.toktokggubi.domain.budget.dto.BudgetAllSaveRequestDto;
import com.ssafy.toktokggubi.domain.budget.dto.BudgetSaveResponseDto;
import com.ssafy.toktokggubi.domain.budget.service.BudgetRecommendService;
import com.ssafy.toktokggubi.domain.report.dto.request.*;
import com.ssafy.toktokggubi.domain.report.dto.response.AiReportInformationResponse;
import com.ssafy.toktokggubi.domain.report.service.AiBudgetPipelineService;
import com.ssafy.toktokggubi.domain.report.service.AiReportInformationService;
import com.ssafy.toktokggubi.domain.report.service.AiUserReportService;
import com.ssafy.toktokggubi.domain.user.service.UserProfileService;
import com.ssafy.toktokggubi.domain.report.dto.response.UserReportResponse;
import com.ssafy.toktokggubi.domain.report.entity.AiUserReport;
import com.ssafy.toktokggubi.domain.user.service.UserProfileService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;

/**
 * AI 월간 리포트 정보 및 사용자 리포트 관련 API를 제공하는 컨트롤러.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/ai/report")
@Tag(name = "AI월간리포트", description = "AI 월간 리포트 정보 제공 API")
public class AiReportInformationController {
    private final YmResolver ymResolver;
    private final AiReportInformationService service;
    private final AiUserReportService aiUserReportService;
    private final UserProfileService userProfileService;
    private final BudgetRecommendService recommendService;
private final AiBudgetPipelineService pipeline;
    /**
     * AI 월간 리포트 정보를 조회합니다.
     * 예산 설정 및 실제 지출 내역을 포함한 월간 리포트 데이터를 반환합니다.
     *
     * @param request 사용자 ID, 닉네임, 조회할 년도 및 월을 포함하는 요청 객체
     * @return AI 월간 리포트 정보 응답 객체 (예산 설정 및 실제 지출 내역 포함)
     */
    @PostMapping("/information")
    @Operation(summary = "AI 예산, 지출 데이터 조회", description = "사용자의 월간 예산 설정 및 실제 지출 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "관련 데이터 없음")
    })
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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "리포트 저장 성공")
    })
    public ResponseEntity<Void> receiveAiUserReport(@RequestBody AiUserReportRequest request) {
        aiUserReportService.saveAiUserReport(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    /**
     * AI 사용자 리포트를 조회합니다.
     * 사용자 ID, 닉네임, 조회할 년도 및 월을 기반으로 AI 월간 리포트 데이터를 반환합니다.
     *
     * @param request 
     * @return AI 월간 사용자 리포트 정보 응답 객체
     */
    @PostMapping("/get")
    @Operation(summary = "AI 사용자 리포트 조회", description = "사용자의 월간 AI 리포트 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "리포트 없음")
    })
    @SecurityRequirement(name = "Authorization")
    public UserReportResponse getAiUserReport(@RequestBody AiUserReportGetRequest request) {
        Long userId = SecurityUtils.currentUserIdOrNull(); // Get userId from SecurityUtils

        // add log of token,

        if (userId == null) {
            throw new IllegalStateException("인증 필요"); // Or handle as appropriate for your application
        }

        String username = userProfileService.getProfile(userId).nickname(); // Get username (nickname) from UserProfileService

        UserInfo userInfo = UserInfo.builder()
                .userId(userId.intValue())
                .username(username)
                .year(request.getYear())
                .month(request.getMonth())
                .build();
        
        return aiUserReportService.getAiUserReport(userInfo);
    }



    public BudgetSaveResponseDto recommend(@RequestBody @Valid AiReportInformationRequest request) {
        return pipeline.recommendFromInfoAndSave(request);
    }

    }



