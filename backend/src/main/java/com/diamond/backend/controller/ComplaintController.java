package com.diamond.backend.controller;

import com.diamond.backend.model.Complaint;
import com.diamond.backend.repository.ComplaintRepository;
import com.diamond.backend.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintService complaintService;

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Complaint> resolveComplaint(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String resolution = request.get("resolution");
        return ResponseEntity.ok(complaintService.resolveComplaint(id, resolution));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Long> distribution = complaintService.getCategoryDistribution();
        
        // Convert to list of entries for frontend compatibility [ ["Category", Count], ... ]
        List<List<Object>> entries = distribution.entrySet().stream()
                .map(e -> List.of((Object)e.getKey(), (Object)e.getValue()))
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(Map.of("categoryDistribution", entries));
    }
}
