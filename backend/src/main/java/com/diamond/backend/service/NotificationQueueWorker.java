package com.diamond.backend.service;

import com.diamond.backend.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import static com.diamond.backend.config.RabbitMQConfig.*;

/**
 * RabbitMQ consumers — one listener per channel queue.
 * Each pulls the notification ID, loads it from DB, and calls Twilio.
 */
@Component
public class NotificationQueueWorker {

    private static final Logger log = LoggerFactory.getLogger(NotificationQueueWorker.class);

    private final NotificationRepository notificationRepository;
    private final TwilioSenderService    twilioSenderService;
    private final NotificationService    notificationService;

    public NotificationQueueWorker(NotificationRepository notificationRepository,
                                   TwilioSenderService twilioSenderService,
                                   NotificationService notificationService) {
        this.notificationRepository = notificationRepository;
        this.twilioSenderService    = twilioSenderService;
        this.notificationService    = notificationService;
    }

    // ---- SMS Worker ----
    @RabbitListener(queues = SMS_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    @Transactional
    public void processSms(Long notificationId) {
        log.info("[SMS-WORKER] Processing notification id={}", notificationId);
        notificationRepository.findById(notificationId).ifPresent(n -> {
            try {
                String sid = twilioSenderService.sendSms(n.getRecipientNumber(), n.getMessage());
                notificationService.markSent(n.getId(), sid);
                log.info("[SMS-WORKER] SUCCESS id={} sid={}", n.getId(), sid);
            } catch (Exception ex) {
                log.error("[SMS-WORKER] FAILED id={} error={}", n.getId(), ex.getMessage());
                notificationService.markFailed(n.getId(), ex.getMessage());
                // Re-throw so RabbitMQ routes to DLQ / retry queue
                throw new RuntimeException(ex);
            }
        });
    }

    // ---- WhatsApp Worker ----
    @RabbitListener(queues = WHATSAPP_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    @Transactional
    public void processWhatsApp(Long notificationId) {
        log.info("[WHATSAPP-WORKER] Processing notification id={}", notificationId);
        notificationRepository.findById(notificationId).ifPresent(n -> {
            try {
                String sid = twilioSenderService.sendWhatsApp(n.getRecipientNumber(), n.getMessage());
                notificationService.markSent(n.getId(), sid);
                log.info("[WHATSAPP-WORKER] SUCCESS id={} sid={}", n.getId(), sid);
            } catch (Exception ex) {
                log.error("[WHATSAPP-WORKER] FAILED id={} error={}", n.getId(), ex.getMessage());
                notificationService.markFailed(n.getId(), ex.getMessage());
                throw new RuntimeException(ex);
            }
        });
    }

    // ---- Voice Worker ----
    @RabbitListener(queues = VOICE_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    @Transactional
    public void processVoice(Long notificationId) {
        log.info("[VOICE-WORKER] Processing notification id={}", notificationId);
        notificationRepository.findById(notificationId).ifPresent(n -> {
            try {
                String sid = twilioSenderService.makeVoiceCall(n.getRecipientNumber(), n.getMessage());
                notificationService.markSent(n.getId(), sid);
                log.info("[VOICE-WORKER] SUCCESS id={} sid={}", n.getId(), sid);
            } catch (Exception ex) {
                log.error("[VOICE-WORKER] FAILED id={} error={}", n.getId(), ex.getMessage());
                notificationService.markFailed(n.getId(), ex.getMessage());
                throw new RuntimeException(ex);
            }
        });
    }

    // ---- Retry Worker (DLQ re-processor) ----
    @RabbitListener(queues = RETRY_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    @Transactional
    public void processRetry(Long notificationId) {
        log.info("[RETRY-WORKER] Re-processing notification id={}", notificationId);
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRetryCount() >= n.getMaxRetries()) {
                log.warn("[RETRY-WORKER] Max retries reached for id={}, marking FAILED", n.getId());
                notificationService.markFailed(n.getId(), "Max retries (" + n.getMaxRetries() + ") exhausted");
                return;
            }
            // Re-route to the appropriate channel queue
            switch (n.getChannel()) {
                case SMS      -> processSms(notificationId);
                case WHATSAPP -> processWhatsApp(notificationId);
                case VOICE    -> processVoice(notificationId);
            }
        });
    }
}
