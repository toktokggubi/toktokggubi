package com.ssafy.toktokggubi.domain.merchant.repository;

import com.ssafy.toktokggubi.domain.merchant.entity.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    List<Merchant> findByMerchantName(String merchantName);
    Optional<Merchant> findFirstByMerchantName(String merchantName);
    Optional<Merchant> findFirstByMerchantNameContaining(String keyword);
}