package com.diamond.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String voterId;
    private String category;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    private String duration;
    private String impact;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    private String boothId;
    private String ac;
    private String partName;
    private String section;
    private String userImageUrl;
    private String resolutionProofUrl;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
    
    // AI Fields
    private String aiCategory;
    
    @Column(columnDefinition = "TEXT")
    private String aiSummary;
    
    private String aiPriority;
    private Integer aiScore = 0;
    
    @Column(columnDefinition = "TEXT")
    private String aiReason;
    
    private Boolean aiProcessed = false;
    
    // System Fields
    private String status = "OPEN";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVoterId() { return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getBoothId() { return boothId; }
    public void setBoothId(String boothId) { this.boothId = boothId; }

    public String getAc() { return ac; }
    public void setAc(String ac) { this.ac = ac; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getUserImageUrl() { return userImageUrl; }
    public void setUserImageUrl(String userImageUrl) { this.userImageUrl = userImageUrl; }

    public String getResolutionProofUrl() { return resolutionProofUrl; }
    public void setResolutionProofUrl(String resolutionProofUrl) { this.resolutionProofUrl = resolutionProofUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public String getAiPriority() { return aiPriority; }
    public void setAiPriority(String aiPriority) { this.aiPriority = aiPriority; }

    public Integer getAiScore() { return aiScore; }
    public void setAiScore(Integer aiScore) { this.aiScore = aiScore; }

    public String getAiReason() { return aiReason; }
    public void setAiReason(String aiReason) { this.aiReason = aiReason; }

    public Boolean getAiProcessed() { return aiProcessed; }
    public void setAiProcessed(Boolean aiProcessed) { this.aiProcessed = aiProcessed; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Transient
    public Long getResolutionTime() {
        if (createdAt != null && resolvedAt != null) {
            return java.time.Duration.between(createdAt, resolvedAt).toMinutes();
        }
        return null;
    }
}
