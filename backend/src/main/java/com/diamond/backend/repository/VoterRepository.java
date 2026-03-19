package com.diamond.backend.repository;

import com.diamond.backend.model.Voter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoterRepository extends JpaRepository<Voter, Long> {
    Optional<Voter> findByVoterId(String voterId);
    List<Voter> findByBoothId(String boothId);
    List<Voter> findByAssemblyConstituencyAc(String ac);
}
