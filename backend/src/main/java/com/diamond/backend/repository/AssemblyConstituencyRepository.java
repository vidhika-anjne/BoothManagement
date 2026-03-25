package com.diamond.backend.repository;

import com.diamond.backend.model.AssemblyConstituency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssemblyConstituencyRepository extends JpaRepository<AssemblyConstituency, Long> {

    List<AssemblyConstituency> findByDistrictId(Long districtId);
}