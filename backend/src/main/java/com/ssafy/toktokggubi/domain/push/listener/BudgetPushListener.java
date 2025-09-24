package com.ssafy.toktokggubi.domain.push.listener;

import com.ssafy.toktokggubi.domain.wallet.event.TxApprovedEvent;
import com.ssafy.toktokggubi.domain.push.service.CategoryBudgetService;
import com.ssafy.toktokggubi.domain.push.service.TotalBudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;


@Slf4j
@Component
@RequiredArgsConstructor
public class BudgetPushListener {

    private final CategoryBudgetService categoryBudgetService;
    private final TotalBudgetService totalBudgetService;

    // @Async // 비동기로 돌리고 싶으면 주석 해제 + @EnableAsync
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onApproved(TxApprovedEvent e) {
        String txNo = e.transactionUniqueNo();
        try {
            categoryBudgetService.checkThreshold(txNo);
            categoryBudgetService.checkExceed(txNo);
            totalBudgetService.checkThreshold(txNo);
            totalBudgetService.checkExceed(txNo);
        } catch (Exception ex) {
            log.warn("[BudgetPush] failed for txNo={}", txNo, ex);
        }
    }
}
