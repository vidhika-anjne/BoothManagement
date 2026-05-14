package com.diamond.backend.dto;

import com.diamond.backend.model.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class NotificationRequestDTO {

    private Long voterId;

    private String voterName;

    @NotBlank(message = "Recipient number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{6,14}$", message = "Invalid phone number format")
    private String recipientNumber;

    @NotNull(message = "Channel is required")
    private NotificationChannel channel;

    @NotBlank(message = "Message is required")
    private String message;

    private String messageTemplate;

    private Integer priority = 5;

    private Integer maxRetries = 3;

    // Getters and Setters
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

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }
}
