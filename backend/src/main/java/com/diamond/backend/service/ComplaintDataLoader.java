package com.diamond.backend.service;

import com.diamond.backend.model.Complaint;
import com.diamond.backend.repository.ComplaintRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
@Order(5)
public class ComplaintDataLoader implements CommandLineRunner {

    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private ResourceLoader resourceLoader;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        if (complaintRepository.count() > 0) {
            System.out.println("[ComplaintDataLoader] Complaints already seeded — skipping.");
            return;
        }

        Resource resource = resourceLoader.getResource("classpath:json/complaints_demo.json");
        try (InputStream is = resource.getInputStream()) {
            List<Complaint> complaints = objectMapper.readValue(is, new TypeReference<List<Complaint>>() {});
            complaintRepository.saveAll(complaints);
            System.out.println("[ComplaintDataLoader] Successfully seeded " + complaints.size() + " demo complaints.");
        } catch (Exception e) {
            System.err.println("[ComplaintDataLoader] Error seeding complaints: " + e.getMessage());
        }
    }
}
