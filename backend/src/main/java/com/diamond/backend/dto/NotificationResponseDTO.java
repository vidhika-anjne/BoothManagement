package com.diamond.backend.dto;

import com.diamond.backend.model.NotificationChannel;
import com.diamond.backend.model.NotificationStatus;
import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Long id;
    private Long voterId;
    private String voterName;
    private String recipientNumber;
    private NotificationChannel channel;
    private String message;
    private NotificationStatus status;
    private String twilioSid;
    private String errorMessage;
    private Integer retryCount;
    private Integer maxRetries;
    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String bulkBatchId;
    private Integer priority;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVoterId() { return voterId; }
    public void setVoterId(Long voterId) { this.voterId = voterId; }

    public String getVoterName() { return voterName; }
    public void setVoterName(String voterName) { this.voterName = voterName; }

    public String getRecipientNumber() { return recipientNumber; }
    public void setRecipientNumber(String recipientNumber) { this.recipientNumber = recipientNumber; }

    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }

    public String getTwilioSid() { return twilioSid; }
    public void setTwilioSid(String twilioSid) { this.twilioSid = twilioSid; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }

    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getBulkBatchId() { return bulkBatchId; }
    public void setBulkBatchId(String bulkBatchId) { this.bulkBatchId = bulkBatchId; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
}
