package com.ssafy.toktokggubi.domain.report.repository;

import com.ssafy.toktokggubi.domain.report.entity.AiUserReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiUserReportRepository extends MongoRepository<AiUserReport, String> {
}
