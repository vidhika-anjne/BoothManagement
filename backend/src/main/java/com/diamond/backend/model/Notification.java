package com.diamond.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_voter_id", columnList = "voter_id"),
    @Index(name = "idx_notification_status", columnList = "status"),
    @Index(name = "idx_notification_channel", columnList = "channel"),
    @Index(name = "idx_notification_created_at", columnList = "created_at")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voter_id")
    private Long voterId;

    @Column(name = "voter_name")
    private String voterName;

    @Column(name = "recipient_number", nullable = false)
    private String recipientNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationChannel channel;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "message_template")
    private String messageTemplate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "twilio_sid")
    private String twilioSid;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "bulk_batch_id")
    private String bulkBatchId;

    @Column(name = "priority", nullable = false)
    private Integer priority = 5;  // 1 = highest, 10 = lowest

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Notification() {}

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

    public String getMessageTemplate() { return messageTemplate; }
    public void setMessageTemplate(String messageTemplate) { this.messageTemplate = messageTemplate; }

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

    public LocalDateTime getNextRetryAt() { return nextRetryAt; }
    public void setNextRetryAt(LocalDateTime nextRetryAt) { this.nextRetryAt = nextRetryAt; }

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
