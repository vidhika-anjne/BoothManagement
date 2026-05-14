package com.diamond.backend.dto;

import com.diamond.backend.model.NotificationChannel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BulkNotificationRequestDTO {

    @NotNull(message = "Channel is required")
    private NotificationChannel channel;

    @NotEmpty(message = "At least one recipient is required")
    @Valid
    private List<BulkRecipientDTO> recipients;

    @NotEmpty(message = "Message template is required")
    private String messageTemplate;

    private Integer priority = 5;
    private Integer maxRetries = 3;

    public static class BulkRecipientDTO {
        private Long voterId;
        private String voterName;
        private String recipientNumber;
        private String customMessage;

        public Long getVoterId() { return voterId; }
        public void setVoterId(Long voterId) { this.voterId = voterId; }
        public String getVoterName() { return voterName; }
        public void setVoterName(String voterName) { this.voterName = voterName; }
        public String getRecipientNumber() { return recipientNumber; }
        public void setRecipientNumber(String recipientNumber) { this.recipientNumber = recipientNumber; }
        public String getCustomMessage() { return customMessage; }
        public void setCustomMessage(String customMessage) { this.customMessage = customMessage; }
    }

    // Getters and Setters
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }

    public List<BulkRecipientDTO> getRecipients() { return recipients; }
    public void setRecipients(List<BulkRecipientDTO> recipients) { this.recipients = recipients; }

    public String getMessageTemplate() { return messageTemplate; }
    public void setMessageTemplate(String messageTemplate) { this.messageTemplate = messageTemplate; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }
}
