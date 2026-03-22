package com.diamond.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.diamond.backend.model.Complaint;
import com.diamond.backend.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ComplaintService {

    private final ComplaintRepository repository;
    private final OllamaAiService aiService;

    public ComplaintService(ComplaintRepository repository, OllamaAiService aiService) {
        this.repository = repository;
        this.aiService = aiService;
    }

    public Complaint submitComplaint(Complaint complaint) {
        // Step 1: Base Rule-based Scoring
        int ruleScore = calculateRuleBasedScore(complaint);
        complaint.setAiScore(ruleScore);
        complaint.setAiPriority(ruleScore >= 7 ? "High" : (ruleScore >= 4 ? "Medium" : "Low"));
        
        // Step 2: Trigger AI conditionally (if complex or 'Other' category)
        boolean isComplex = complaint.getDescription() != null && 
                            (complaint.getDescription().length() > 50 || "Other".equalsIgnoreCase(complaint.getCategory()));

        if (isComplex) {
            JsonNode aiOutput = aiService.analyzeComplaint(
                complaint.getDescription(), complaint.getDuration(), 
                complaint.getImpact(), complaint.getDetails()
            );
            
            if (aiOutput != null) {
                if (aiOutput.has("category")) complaint.setAiCategory(aiOutput.get("category").asText(complaint.getCategory()));
                if (aiOutput.has("summary")) complaint.setAiSummary(aiOutput.get("summary").asText());
                if (aiOutput.has("score")) complaint.setAiScore(Math.max(ruleScore, aiOutput.get("score").asInt(ruleScore)));
                if (aiOutput.has("priority")) complaint.setAiPriority(aiOutput.get("priority").asText(complaint.getAiPriority()));
                if (aiOutput.has("reason")) complaint.setAiReason(aiOutput.get("reason").asText());
                complaint.setAiProcessed(true);
            }
        }
        return repository.save(complaint);
    }

    private int calculateRuleBasedScore(Complaint c) {
        int score = 0;
        
        if (c.getDuration() != null) {
            if (c.getDuration().contains(">1 week")) score += 4;
            else if (c.getDuration().contains("3-7 days")) score += 3;
            else if (c.getDuration().contains("1-2 days")) score += 1;
        }
        
        if (c.getImpact() != null) {
            if (c.getImpact().contains("Entire area")) score += 5;
            else if (c.getImpact().contains("Few houses")) score += 3;
            else if (c.getImpact().contains("Household")) score += 1;
        }
        
        if (c.getDescription() != null && c.getDescription().toLowerCase().matches(".*(fire|blood|accident|hospital|death|danger|pipeline|leak).*")) {
            score += 5;
        }
        
        return Math.min(score, 10);
    }
    
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("categoryDistribution", repository.countByCategory());
        analytics.put("boothHotspots", repository.countByBooth());
        return analytics;
    }
}
