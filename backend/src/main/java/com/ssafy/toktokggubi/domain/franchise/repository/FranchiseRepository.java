package com.ssafy.toktokggubi.domain.franchise.repository;

import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FranchiseRepository extends JpaRepository<Franchise, Long> {
    Optional<Franchise> findFirstByMerchantName(String merchantName);
}