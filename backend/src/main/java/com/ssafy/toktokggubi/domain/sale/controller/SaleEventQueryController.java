package com.ssafy.toktokggubi.domain.sale.controller;

import com.ssafy.toktokggubi.domain.sale.dto.response.SaleEventResponse;
import com.ssafy.toktokggubi.domain.sale.service.SaleEventQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sale-events")
@Tag(name = "세일 & 이벤트", description = "세일 & 이벤트 관련 API")
public class SaleEventQueryController {

    private final SaleEventQueryService saleEventQueryService;

    @Operation(
            summary = "월별 세일 이벤트 조회",
            description = "주어진 연/월 및 (선택) 프랜차이즈로 세일 이벤트 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK",
                            content = @Content(array = @ArraySchema(schema = @Schema(implementation = SaleEventResponse.class))))
            }
    )
    @GetMapping("/month")
    public List<SaleEventResponse> getByMonth(
            @Parameter(description = "연도(2000~2100)", example = "2025") @RequestParam int year,
            @Parameter(description = "월(1~12)", example = "9") @RequestParam int month,
            @Parameter(description = "프랜차이즈 ID", required = false) @RequestParam(required = false) Long franchiseId
    ) {
        return saleEventQueryService.getByMonth(year, month, franchiseId);
    }

    @Operation(
            summary = "기간별 세일 이벤트 조회(양 끝 포함)",
            description = "시작일~종료일(포함)과 (선택) 프랜차이즈로 세일 이벤트 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK",
                            content = @Content(array = @ArraySchema(schema = @Schema(implementation = SaleEventResponse.class)))),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청(날짜 범위 오류)")
            }
    )
    @GetMapping("/period")
    public List<SaleEventResponse> getByPeriod(
            @Parameter(description = "시작일(YYYY-MM-DD)", example = "2025-09-01") @RequestParam String startDate,
            @Parameter(description = "종료일(YYYY-MM-DD)", example = "2025-10-15") @RequestParam String endDate,
            @Parameter(description = "프랜차이즈 ID", required = false) @RequestParam(required = false) Long franchiseId
    ) {
        return saleEventQueryService.getByPeriod(
                LocalDate.parse(startDate),
                LocalDate.parse(endDate),
                franchiseId
        );
    }
}