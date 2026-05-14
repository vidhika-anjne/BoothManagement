package com.diamond.backend.repository;

import com.diamond.backend.model.BoothSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoothSectionRepository extends JpaRepository<BoothSection, Long> {
    List<BoothSection> findByBoothPart_PartId(Long partId);
}
