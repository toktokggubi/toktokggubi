package com.ssafy.toktokggubi.domain.report.dto.response;

import com.ssafy.toktokggubi.domain.report.dto.request.SpendingDetails;
import com.ssafy.toktokggubi.domain.report.dto.request.SummaryReport;
import com.ssafy.toktokggubi.domain.report.dto.request.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReportResponse {
    private UserInfo userInfo;
    private SummaryReport summaryReport;
    private SpendingDetails spendingDetails;
}
