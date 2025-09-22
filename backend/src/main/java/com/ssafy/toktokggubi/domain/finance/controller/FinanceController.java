package com.ssafy.toktokggubi.domain.finance.controller;

import com.ssafy.toktokggubi.domain.finance.service.FinanceCollectService;
import com.ssafy.toktokggubi.domain.user.dto.response.FinanceSyncResponse;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/finance")
@RequiredArgsConstructor
@Tag(name = "[금융망] 사용자 계좌&카드", description = "[금융망] 사용자 계좌&카드 조회 후 저장 API")
public class FinanceController {

    private final FinanceCollectService financeCollectService;

    @PostMapping("/collect")
    public FinanceSyncResponse collect() {
        Long uid = SecurityUtils.currentUserIdOrNull();
        if (uid == null) throw new IllegalStateException("인증 필요");
        return financeCollectService.collectAndUpsert(uid);
    }
}
