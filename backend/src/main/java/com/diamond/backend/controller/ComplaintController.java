package com.diamond.backend.controller;

import com.diamond.backend.model.Complaint;
import com.diamond.backend.repository.ComplaintRepository;
import com.diamond.backend.service.ComplaintService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin("*")
public class ComplaintController {

    private final ComplaintService service;
    private final ComplaintRepository repository;

    public ComplaintController(ComplaintService service, ComplaintRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return service.submitComplaint(complaint);
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return repository.findAllByOrderByAiScoreDesc(); 
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        return service.getAnalytics();
    }
}
