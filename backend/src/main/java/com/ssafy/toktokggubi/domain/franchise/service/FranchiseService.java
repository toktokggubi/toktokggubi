package com.ssafy.toktokggubi.domain.franchise.service;

import com.ssafy.toktokggubi.domain.franchise.dto.response.FranchiseItemResponse;
import com.ssafy.toktokggubi.domain.franchise.dto.response.FranchiseListResponse;
import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import com.ssafy.toktokggubi.domain.franchise.repository.FranchiseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FranchiseService {

    private final FranchiseRepository franchiseRepository;

    /**
     * @param q 부분 검색 (franchiseName LIKE %q%), null 허용
     */
    public FranchiseListResponse list(String q) {
        Sort s = Sort.by(Sort.Direction.ASC, "franchiseName");
        List<Franchise> rows = (q == null || q.isBlank())
                ? franchiseRepository.findAll(s)
                : franchiseRepository.findByFranchiseNameContaining(q, s);

        var items = rows.stream()
                .map(f -> new FranchiseItemResponse(
                        f.getFranchiseId(), f.getFranchiseName(), f.getImageUrl()))
                .toList();

        return new FranchiseListResponse(items);
    }
}
