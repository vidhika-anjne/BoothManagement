package com.diamond.backend.service;

import com.diamond.backend.dto.BulkNotificationRequestDTO;
import com.diamond.backend.dto.NotificationRequestDTO;
import com.diamond.backend.dto.NotificationResponseDTO;
import com.diamond.backend.model.Notification;
import com.diamond.backend.model.NotificationChannel;
import com.diamond.backend.model.NotificationStatus;
import com.diamond.backend.repository.NotificationRepository;
import com.diamond.backend.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final RabbitTemplate          rabbitTemplate;
    private final TwilioSenderService     twilioSenderService;

    public NotificationService(NotificationRepository notificationRepository,
                               RabbitTemplate rabbitTemplate,
                               TwilioSenderService twilioSenderService) {
        this.notificationRepository = notificationRepository;
        this.rabbitTemplate         = rabbitTemplate;
        this.twilioSenderService    = twilioSenderService;
    }

    // ----------------------------------------------------------------
    // Single notification
    // ----------------------------------------------------------------
    public NotificationResponseDTO sendNotification(NotificationRequestDTO request) {
        Notification notification = buildNotification(request, null);
        notification = notificationRepository.save(notification);
        enqueueOrSendDirect(notification);
        return toDTO(notification);
    }

    // ----------------------------------------------------------------
    // Bulk notification
    // ----------------------------------------------------------------
    public Map<String, Object> sendBulkNotifications(BulkNotificationRequestDTO request) {
        String batchId = UUID.randomUUID().toString();
        List<Notification> notifications = new ArrayList<>();

        for (BulkNotificationRequestDTO.BulkRecipientDTO recipient : request.getRecipients()) {
            String message = (recipient.getCustomMessage() != null && !recipient.getCustomMessage().isBlank())
                    ? recipient.getCustomMessage()
                    : request.getMessageTemplate();

            NotificationRequestDTO singleReq = new NotificationRequestDTO();
            singleReq.setVoterId(recipient.getVoterId());
            singleReq.setVoterName(recipient.getVoterName());
            singleReq.setRecipientNumber(recipient.getRecipientNumber());
            singleReq.setChannel(request.getChannel());
            singleReq.setMessage(message);
            singleReq.setMessageTemplate(request.getMessageTemplate());
            singleReq.setPriority(request.getPriority());
            singleReq.setMaxRetries(request.getMaxRetries());

            Notification notification = buildNotification(singleReq, batchId);
            notifications.add(notification);
        }

        List<Notification> saved = notificationRepository.saveAll(notifications);
        saved.forEach(this::enqueueOrSendDirect);

        Map<String, Object> result = new HashMap<>();
        result.put("batchId", batchId);
        result.put("totalQueued", saved.size());
        result.put("channel", request.getChannel());
        result.put("timestamp", LocalDateTime.now());
        return result;
    }

    // ----------------------------------------------------------------
    // Retry scheduler — runs every 2 minutes
    // ----------------------------------------------------------------
    @Scheduled(fixedDelay = 120_000)
    public void retryFailedNotifications() {
        List<Notification> eligible = notificationRepository.findEligibleForRetry(LocalDateTime.now());
        if (eligible.isEmpty()) return;

        log.info("Retrying {} failed notifications", eligible.size());
        for (Notification n : eligible) {
            n.setStatus(NotificationStatus.RETRYING);
            n.setRetryCount(n.getRetryCount() + 1);
            n.setNextRetryAt(LocalDateTime.now().plusMinutes(exponentialBackoffMinutes(n.getRetryCount())));
            notificationRepository.save(n);
            enqueueOrSendDirect(n);
        }
    }

    // ----------------------------------------------------------------
    // Status updates (called by queue workers or direct sender)
    // ----------------------------------------------------------------
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markSent(Long id, String twilioSid) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setStatus(NotificationStatus.SENT);
            n.setTwilioSid(twilioSid);
            n.setSentAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(Long id, String errorMessage) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getRetryCount() >= n.getMaxRetries()) {
                n.setStatus(NotificationStatus.FAILED);
            } else {
                n.setStatus(NotificationStatus.RETRYING);
                n.setNextRetryAt(LocalDateTime.now().plusMinutes(
                        exponentialBackoffMinutes(n.getRetryCount() + 1)));
            }
            n.setErrorMessage(errorMessage);
            notificationRepository.save(n);
        });
    }

    // ----------------------------------------------------------------
    // Query methods
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getAllNotifications(Pageable pageable) {
        return notificationRepository.findByOrderByCreatedAtDesc(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<NotificationResponseDTO> getById(Long id) {
        return notificationRepository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getByVoterId(Long voterId, Pageable pageable) {
        return notificationRepository.findByVoterIdOrderByCreatedAtDesc(voterId, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getBatchStatus(String batchId) {
        return notificationRepository.findByBulkBatchIdOrderByCreatedAtDesc(batchId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // Status breakdown
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (NotificationStatus s : NotificationStatus.values()) {
            statusCounts.put(s.name(), notificationRepository.countByStatus(s));
        }
        stats.put("byStatus", statusCounts);

        // Channel breakdown
        List<Object[]> channelRows = notificationRepository.getChannelStatistics();
        List<Map<String, Object>> channelStats = new ArrayList<>();
        for (Object[] row : channelRows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("channel", row[0]);
            entry.put("total", row[1]);
            entry.put("success", row[2]);
            entry.put("failed", row[3]);
            channelStats.add(entry);
        }
        stats.put("byChannel", channelStats);

        // Recent (last 24 h)
        List<Notification> recent = notificationRepository.findRecentNotifications(
                LocalDateTime.now().minusHours(24));
        stats.put("last24h", recent.size());
        return stats;
    }

    // ----------------------------------------------------------------
    // Core: try queue first, fall back to direct Twilio call
    // ----------------------------------------------------------------
    private void enqueueOrSendDirect(Notification n) {
        try {
            String routingKey = switch (n.getChannel()) {
                case SMS      -> RabbitMQConfig.SMS_ROUTING_KEY;
                case WHATSAPP -> RabbitMQConfig.WHATSAPP_ROUTING_KEY;
                case VOICE    -> RabbitMQConfig.VOICE_ROUTING_KEY;
            };
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE, routingKey, n.getId());
            log.info("Notification {} enqueued on {}", n.getId(), routingKey);
        } catch (AmqpException | Exception ex) {
            // RabbitMQ unavailable — send directly via Twilio so the message still goes out
            log.warn("RabbitMQ unavailable ({}), sending {} directly via Twilio", ex.getMessage(), n.getId());
            sendDirectViaTwilio(n);
        }
    }

    /**
     * Synchronous Twilio dispatch — used as fallback when RabbitMQ is down.
     * Runs in the same HTTP request thread.
     */
    private void sendDirectViaTwilio(Notification n) {
        try {
            String sid;
            if (n.getChannel() == NotificationChannel.SMS) {
                sid = twilioSenderService.sendSms(n.getRecipientNumber(), n.getMessage());
            } else if (n.getChannel() == NotificationChannel.WHATSAPP) {
                sid = twilioSenderService.sendWhatsApp(n.getRecipientNumber(), n.getMessage());
            } else {
                sid = twilioSenderService.makeVoiceCall(n.getRecipientNumber(), n.getMessage());
            }
            n.setStatus(NotificationStatus.SENT);
            n.setTwilioSid(sid);
            n.setSentAt(LocalDateTime.now());
            notificationRepository.save(n);
            log.info("Direct Twilio send SUCCESS: id={} sid={}", n.getId(), sid);
        } catch (Exception ex) {
            log.error("Direct Twilio send FAILED: id={} error={}", n.getId(), ex.getMessage());
            n.setStatus(NotificationStatus.FAILED);
            n.setErrorMessage(ex.getMessage());
            notificationRepository.save(n);
        }
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------
    private Notification buildNotification(NotificationRequestDTO req, String batchId) {
        Notification n = new Notification();
        n.setVoterId(req.getVoterId());
        n.setVoterName(req.getVoterName());
        n.setRecipientNumber(req.getRecipientNumber());
        n.setChannel(req.getChannel());
        n.setMessage(req.getMessage());
        n.setMessageTemplate(req.getMessageTemplate());
        n.setStatus(NotificationStatus.QUEUED);
        n.setPriority(req.getPriority() != null ? req.getPriority() : 5);
        n.setMaxRetries(req.getMaxRetries() != null ? req.getMaxRetries() : 3);
        n.setBulkBatchId(batchId);
        return n;
    }

    private long exponentialBackoffMinutes(int attempt) {
        return (long) Math.pow(2, attempt); // 2, 4, 8 minutes...
    }

    private NotificationResponseDTO toDTO(Notification n) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(n.getId());
        dto.setVoterId(n.getVoterId());
        dto.setVoterName(n.getVoterName());
        dto.setRecipientNumber(n.getRecipientNumber());
        dto.setChannel(n.getChannel());
        dto.setMessage(n.getMessage());
        dto.setStatus(n.getStatus());
        dto.setTwilioSid(n.getTwilioSid());
        dto.setErrorMessage(n.getErrorMessage());
        dto.setRetryCount(n.getRetryCount());
        dto.setMaxRetries(n.getMaxRetries());
        dto.setSentAt(n.getSentAt());
        dto.setDeliveredAt(n.getDeliveredAt());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setUpdatedAt(n.getUpdatedAt());
        dto.setBulkBatchId(n.getBulkBatchId());
        dto.setPriority(n.getPriority());
        return dto;
    }
}
