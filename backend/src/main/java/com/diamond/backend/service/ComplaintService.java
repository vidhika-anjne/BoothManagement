package com.diamond.backend.service;

import com.diamond.backend.model.Complaint;
import com.diamond.backend.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @Transactional
    public Complaint createComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint resolveComplaint(Long id, String resolution) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        complaint.setStatus("RESOLVED");
        complaint.setResolution(resolution);
        complaint.setResolvedAt(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getComplaintsByVoter(String voterId) {
        return complaintRepository.findByVoterId(voterId);
    }

    public Map<String, Long> getCategoryDistribution() {
        List<Complaint> all = complaintRepository.findAll();
        return all.stream()
                .map(c -> {
                    String cat = c.getAiCategory() != null ? c.getAiCategory() : c.getCategory();
                    return cat == null ? "Uncategorized" : cat;
                })
                .collect(Collectors.groupingBy(
                        cat -> cat,
                        Collectors.counting()
                ));
    }
}
