package com.ssafy.toktokggubi.domain.finance.client;

import com.ssafy.toktokggubi.domain.finance.dto.request.FinanceHeaderRequest;
import com.ssafy.toktokggubi.domain.finance.dto.request.InquireDemandDepositAccountListRequest;
import com.ssafy.toktokggubi.domain.finance.dto.request.InquireSignUpCreditCardListRequest;
import com.ssafy.toktokggubi.domain.finance.dto.response.InquireAccountsResponse;
import com.ssafy.toktokggubi.domain.finance.dto.response.InquireCardsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class FinopenEduClient {
    private final WebClient.Builder webClientBuilder;
    private final FinanceHeaderFactory headerFactory;

    @Value("${finance.api.base-url}")
    private String base;

    private WebClient client() {
        return webClientBuilder.baseUrl(base).build();
    }

    public InquireAccountsResponse inquireDemandDepositAccountList(String userKey) {
        String apiName = "inquireDemandDepositAccountList";
        FinanceHeaderRequest header = headerFactory.build(apiName, userKey);
        return client().post()
                .uri("/edu/demandDeposit/inquireDemandDepositAccountList")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new InquireDemandDepositAccountListRequest(header))
                .retrieve()
                .bodyToMono(InquireAccountsResponse.class)
                .block();
    }

    public InquireCardsResponse inquireSignUpCreditCardList(String userKey) {
        String apiName = "inquireSignUpCreditCardList";
        FinanceHeaderRequest header = headerFactory.build(apiName, userKey);
        return client().post()
                .uri("/edu/creditCard/inquireSignUpCreditCardList")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new InquireSignUpCreditCardListRequest(header))
                .retrieve()
                .bodyToMono(InquireCardsResponse.class)
                .block();
    }
}
