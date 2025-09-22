package com.ssafy.toktokggubi.domain.gifticon.repository;

import com.ssafy.toktokggubi.domain.gifticon.entity.Gifticon;
import com.ssafy.toktokggubi.domain.gifticon.entity.GifticonStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GifticonRepository extends JpaRepository<Gifticon, Long> {
    List<Gifticon> findByUser_UserIdAndStatusNot(Long userId, GifticonStatus statusToExclude);
}
