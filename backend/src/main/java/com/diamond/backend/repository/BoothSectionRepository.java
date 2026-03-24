package com.diamond.backend.repository;

import com.diamond.backend.model.BoothSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoothSectionRepository extends JpaRepository<BoothSection, Long> {
    List<BoothSection> findByBoothPartId(Long boothPartId);
    List<BoothSection> findByBoothPartPartId(Long partId);

    @Query("SELECT DISTINCT s.sectionName FROM BoothSection s WHERE LOWER(s.boothPart.acName) = LOWER(:ac) AND s.boothPart.partName = :part")
    List<String> findSectionsByAcAndPart(@Param("ac") String ac, @Param("part") String part);
}
