package com.diamond.backend.repository;

import com.diamond.backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByOrderByAiScoreDesc();
    
    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();
    
    @Query("SELECT c.boothId, COUNT(c) FROM Complaint c GROUP BY c.boothId")
    List<Object[]> countByBooth();
}
