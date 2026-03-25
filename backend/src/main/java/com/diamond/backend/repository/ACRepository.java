package com.diamond.backend.repository;

import com.diamond.backend.model.AC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ACRepository extends JpaRepository<AC, Integer> {
    List<AC> findByDistrictDistrictId(String districtId);
}
