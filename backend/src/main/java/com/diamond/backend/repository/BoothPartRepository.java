package com.diamond.backend.repository;

import com.diamond.backend.model.BoothPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface BoothPartRepository extends JpaRepository<BoothPart, Long> {
    List<BoothPart> findByAcName(String acName);

    @Query("SELECT DISTINCT b.districtName FROM BoothPart b WHERE b.districtName IS NOT NULL")
    List<String> findDistinctDistrictNames();

    @Query("SELECT DISTINCT b.acName FROM BoothPart b WHERE b.districtName = :districtName")
    List<String> findDistinctAcNamesByDistrictName(@Param("districtName") String districtName);
}
