package com.ssafy.toktokggubi.domain.card.repository;

import com.ssafy.toktokggubi.domain.card.entity.CardIssuer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardIssuerRepository extends JpaRepository<CardIssuer, String> {
}