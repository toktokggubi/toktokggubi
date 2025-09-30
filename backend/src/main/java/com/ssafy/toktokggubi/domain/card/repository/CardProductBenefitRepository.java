package com.ssafy.toktokggubi.domain.card.repository;

import com.ssafy.toktokggubi.domain.card.entity.CardProductBenefit;
import com.ssafy.toktokggubi.domain.card.entity.CardProductBenefitId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardProductBenefitRepository extends JpaRepository<CardProductBenefit, CardProductBenefitId> {
    List<CardProductBenefit> findByCardProduct_CardUniqueNo(String cardUniqueNo);

    Optional<CardProductBenefit> findByCardProduct_CardUniqueNoAndFranchise_FranchiseId(String cardUniqueNo, Long franchiseId);
}