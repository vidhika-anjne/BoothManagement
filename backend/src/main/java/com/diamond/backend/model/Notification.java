package com.diamond.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String messageBody;
    private String type; // "Resolved", "In Progress", "Updates"
    
    @Column(name = "booth_id")
    private Long boothId;
    
    private String area;
    private Long linkedIssueId;
    private String responsibleDepartment;
    private Integer estimatedRecipients;
    private String visualType; // "before-after", "chart", "other"
    private String beforeDescription;
    private String afterDescription;
    
    @ElementCollection
    @CollectionTable(name = "notification_channels", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "channel")
    private Set<String> channels; // SMS, WhatsApp, App, Voice
    
    private Integer successCount = 0;
    private Integer failureCount = 0;
    private Double deliveryRate = 0.0;
    
    private String status; // PENDING, SENT, PARTIAL, FAILED
    
    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    private String createdBy;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessageBody() { return messageBody; }
    public void setMessageBody(String messageBody) { this.messageBody = messageBody; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getBoothId() { return boothId; }
    public void setBoothId(Long boothId) { this.boothId = boothId; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public Long getLinkedIssueId() { return linkedIssueId; }
    public void setLinkedIssueId(Long linkedIssueId) { this.linkedIssueId = linkedIssueId; }

    public String getResponsibleDepartment() { return responsibleDepartment; }
    public void setResponsibleDepartment(String responsibleDepartment) { this.responsibleDepartment = responsibleDepartment; }

    public Integer getEstimatedRecipients() { return estimatedRecipients; }
    public void setEstimatedRecipients(Integer estimatedRecipients) { this.estimatedRecipients = estimatedRecipients; }

    public String getVisualType() { return visualType; }
    public void setVisualType(String visualType) { this.visualType = visualType; }

    public String getBeforeDescription() { return beforeDescription; }
    public void setBeforeDescription(String beforeDescription) { this.beforeDescription = beforeDescription; }

    public String getAfterDescription() { return afterDescription; }
    public void setAfterDescription(String afterDescription) { this.afterDescription = afterDescription; }

    public Set<String> getChannels() { return channels; }
    public void setChannels(Set<String> channels) { this.channels = channels; }

    public Integer getSuccessCount() { return successCount; }
    public void setSuccessCount(Integer successCount) { this.successCount = successCount; }

    public Integer getFailureCount() { return failureCount; }
    public void setFailureCount(Integer failureCount) { this.failureCount = failureCount; }

    public Double getDeliveryRate() { return deliveryRate; }
    public void setDeliveryRate(Double deliveryRate) { this.deliveryRate = deliveryRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
