package com.diamond.backend.repository;

import com.diamond.backend.model.BoothPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface BoothPartRepository extends JpaRepository<BoothPart, Long> {
    Optional<BoothPart> findByPartId(Long partId);
    List<BoothPart> findByAcNumber(Integer acNumber);
    Optional<BoothPart> findByAcNumberAndPartNumber(Integer acNumber, Integer partNumber);
    List<BoothPart> findByDistrictId(String districtId);
    List<BoothPart> findByAcName(String acName);

    @Query("SELECT DISTINCT new map(b.partName as partName) FROM BoothPart b WHERE LOWER(b.acName) = LOWER(:ac)")
    List<Map<String, Object>> findPartsByAc(@Param("ac") String ac);
}
