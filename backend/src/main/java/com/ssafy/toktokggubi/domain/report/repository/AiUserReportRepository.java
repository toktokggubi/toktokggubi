package com.ssafy.toktokggubi.domain.report.repository;

import com.ssafy.toktokggubi.domain.report.entity.AiUserReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AiUserReportRepository extends MongoRepository<AiUserReport, String> {
    Optional<AiUserReport> findByUserInfo_UserIdAndUserInfo_UsernameAndUserInfo_YearAndUserInfo_Month(
            Integer userId, String username, Integer year, Integer month);
}
