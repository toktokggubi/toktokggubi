package com.ssafy.toktokggubi.domain.franchise.controller;

import com.ssafy.toktokggubi.domain.franchise.dto.response.FranchiseListResponse;
import com.ssafy.toktokggubi.domain.franchise.service.FranchiseService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/franchises")
@Tag(name = "프랜차이즈", description = "프랜차이즈(브랜드) 목록 조회")
public class FranchiseController {

    private final FranchiseService franchiseService;

    @GetMapping
    public ResponseEntity<FranchiseListResponse> list(
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(franchiseService.list(q));
    }
}
