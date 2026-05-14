package com.diamond.backend.repository;

import com.diamond.backend.model.Voter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoterRepository extends JpaRepository<Voter, Long>, JpaSpecificationExecutor<Voter> {
    Optional<Voter> findByVoterId(String voterId);
    Optional<Voter> findByMobileNumber(String mobileNumber);
    List<Voter> findByPartId(Long partId);
    
    @Modifying
    @Transactional
    void deleteByVoterId(String voterId);
}
