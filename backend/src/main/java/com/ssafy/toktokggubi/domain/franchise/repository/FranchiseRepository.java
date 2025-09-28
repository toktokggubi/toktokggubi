package com.ssafy.toktokggubi.domain.franchise.repository;

import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FranchiseRepository extends JpaRepository<Franchise, Long> {
    Optional<Franchise> findFirstByFranchiseName(String merchantName);

    List<Franchise> findByFranchiseNameContaining(String keyword, Sort sort);
}