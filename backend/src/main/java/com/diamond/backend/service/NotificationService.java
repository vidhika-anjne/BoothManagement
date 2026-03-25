package com.diamond.backend.service;

import com.diamond.backend.model.Notification;
import com.diamond.backend.model.Voter;
import com.diamond.backend.repository.NotificationRepository;
import com.diamond.backend.repository.VoterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private VoterRepository voterRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // Mock SMS provider
    private SmsProvider smsProvider = new SmsProvider();
    
    // Mock WhatsApp provider
    private WhatsAppProvider whatsAppProvider = new WhatsAppProvider();
    
    // Mock Voice provider
    private VoiceProvider voiceProvider = new VoiceProvider();
    
    /**
     * Send notification through selected channels
     */
    public Notification sendNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setStatus("PENDING");
        
        // Save notification record
        Notification saved = notificationRepository.save(notification);
        
        // Get voters based on booth
        List<Voter> voters = voterRepository.findByPartId(notification.getBoothId());
        
        if (voters.isEmpty()) {
            saved.setStatus("FAILED");
            saved.setFailureCount(0);
            saved.setSuccessCount(0);
            return notificationRepository.save(saved);
        }
        
        // Send through selected channels asynchronously
        CompletableFuture.runAsync(() -> {
            int success = 0;
            int failure = 0;
            
            for (Voter voter : voters) {
                if (voter.getMobileNumber() == null) {
                    failure++;
                    continue;
                }
                
                // SMS Channel
                if (notification.getChannels().contains("SMS")) {
                    try {
                        smsProvider.sendSMS(voter.getMobileNumber(), notification.getMessageBody());
                        success++;
                    } catch (Exception e) {
                        failure++;
                        System.err.println("SMS failed for " + voter.getMobileNumber() + ": " + e.getMessage());
                    }
                }
                
                // WhatsApp Channel
                if (notification.getChannels().contains("WhatsApp")) {
                    try {
                        whatsAppProvider.sendWhatsApp(voter.getMobileNumber(), notification.getMessageBody());
                        success++;
                    } catch (Exception e) {
                        failure++;
                        System.err.println("WhatsApp failed for " + voter.getMobileNumber() + ": " + e.getMessage());
                    }
                }
                
                // Voice Channel
                if (notification.getChannels().contains("Voice")) {
                    try {
                        voiceProvider.sendVoiceCall(voter.getMobileNumber(), notification.getTitle(), notification.getMessageBody());
                        success++;
                    } catch (Exception e) {
                        failure++;
                        System.err.println("Voice failed for " + voter.getMobileNumber() + ": " + e.getMessage());
                    }
                }
            }
            
            // App Notification Channel (real-time via WebSocket)
            if (notification.getChannels().contains("App")) {
                for (Voter voter : voters) {
                    messagingTemplate.convertAndSend("/topic/notifications/" + voter.getId(), notification);
                }
                success += voters.size();
            }
            
            // Update notification with results
            saved.setSuccessCount(success);
            saved.setFailureCount(failure);
            saved.setDeliveryRate((double) success / (success + failure) * 100);
            saved.setStatus(failure == 0 ? "SENT" : "PARTIAL");
            saved.setSentAt(LocalDateTime.now());
            notificationRepository.save(saved);
        });
        
        return saved;
    }
    
    /**
     * Get all notifications
     */
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }
    
    /**
     * Get notifications by booth
     */
    public List<Notification> getNotificationsByBooth(Long boothId) {
        return notificationRepository.findByBoothIdOrderByCreatedAtDesc(boothId);
    }
    
    /**
     * Get notification statistics
     */
    public Map<String, Object> getStatistics() {
        List<Notification> all = notificationRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSent", all.stream().filter(n -> n.getStatus().equals("SENT")).count());
        stats.put("totalResolved", all.stream().filter(n -> n.getStatus().equals("SENT")).mapToInt(Notification::getSuccessCount).sum());
        stats.put("inProgress", all.stream().filter(n -> n.getStatus().equals("PENDING")).count());
        stats.put("citizensNotified", all.stream().mapToInt(Notification::getSuccessCount).sum());
        stats.put("averageDeliveryRate", all.stream().mapToDouble(Notification::getDeliveryRate).average().orElse(0.0));
        
        return stats;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // CHANNEL PROVIDERS (Mock implementations - can be swapped with Twilio/Firebase etc)
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * SMS Provider (Mock)
     * Replace with Twilio/AWS SNS/Fast2SMS etc
     */
    public static class SmsProvider {
        public void sendSMS(String mobileNumber, String message) throws Exception {
            // Mock implementation - logs instead of sending
            System.out.println("📨 SMS sent to " + mobileNumber + ": " + message.substring(0, Math.min(50, message.length())) + "...");
            
            // TODO: Replace with actual SMS API
            // Example Twilio:
            /*
            Twilio.init("ACCOUNT_SID", "AUTH_TOKEN");
            Message msg = Message.creator(
                new PhoneNumber("+91" + mobileNumber),
                new PhoneNumber("+1234567890"),
                message
            ).create();
            */
        }
    }
    
    /**
     * WhatsApp Provider (Mock)
     * Replace with Twilio WhatsApp/Meta Messenger API etc
     */
    public static class WhatsAppProvider {
        public void sendWhatsApp(String mobileNumber, String message) throws Exception {
            // Mock implementation
            System.out.println("💬 WhatsApp sent to " + mobileNumber + ": " + message.substring(0, Math.min(50, message.length())) + "...");
            
            // TODO: Replace with actual WhatsApp API
            // Example Twilio WhatsApp:
            /*
            Twilio.init("ACCOUNT_SID", "AUTH_TOKEN");
            Message msg = Message.creator(
                new PhoneNumber("whatsapp:+91" + mobileNumber),
                new PhoneNumber("whatsapp:+1234567890"),
                message
            ).create();
            */
        }
    }
    
    /**
     * Voice Provider (Mock)
     * Replace with Twilio Voice/Exotel etc
     */
    public static class VoiceProvider {
        public void sendVoiceCall(String mobileNumber, String title, String message) throws Exception {
            // Mock implementation
            System.out.println("📞 Voice call initiated to " + mobileNumber + " - " + title);
            
            // TODO: Replace with actual Voice API
            // Example Twilio Voice:
            /*
            Twilio.init("ACCOUNT_SID", "AUTH_TOKEN");
            Call call = Call.creator(
                new PhoneNumber("+91" + mobileNumber),
                new PhoneNumber("+1234567890"),
                new URI("https://.../voice-ivr")
            ).create();
            */
        }
    }
}
