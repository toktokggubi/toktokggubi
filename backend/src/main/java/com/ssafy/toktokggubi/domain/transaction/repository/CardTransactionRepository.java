package com.ssafy.toktokggubi.domain.transaction.repository;

import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardTransactionRepository extends JpaRepository<CardTransaction, String> {
}