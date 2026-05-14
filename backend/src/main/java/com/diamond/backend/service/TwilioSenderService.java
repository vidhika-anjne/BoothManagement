package com.diamond.backend.service;

import com.diamond.backend.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.rest.api.v2010.account.MessageCreator;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Low-level Twilio API wrapper.
 * Uses MessagingServiceSid when configured (preferred), falls back to phoneNumber.
 * Retries automatically on transient failures with exponential back-off.
 */
@Service
public class TwilioSenderService {

    private static final Logger log = LoggerFactory.getLogger(TwilioSenderService.class);

    private final TwilioConfig twilioConfig;

    public TwilioSenderService(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
    }

    // ---- SMS ----
    @Retryable(retryFor = Exception.class, maxAttempts = 3,
               backoff = @Backoff(delay = 2000, multiplier = 2))
    public String sendSms(String to, String body) {
        log.info("Sending SMS to {}", to);

        MessageCreator creator;
        String msid = twilioConfig.getMessagingServiceSid();
        if (StringUtils.hasText(msid)) {
            // Preferred: use MessagingServiceSid (matches your curl command)
            creator = Message.creator(new PhoneNumber(to), msid, body);
            log.debug("Using MessagingServiceSid: {}", msid);
        } else {
            // Fallback: use raw phone number
            creator = Message.creator(new PhoneNumber(to), new PhoneNumber(twilioConfig.getPhoneNumber()), body);
            log.debug("Using fallback phoneNumber: {}", twilioConfig.getPhoneNumber());
        }

        Message message = creator.create();
        log.info("SMS sent – SID: {}", message.getSid());
        return message.getSid();
    }

    @Recover
    public String recoverSms(Exception e, String to, String body) {
        log.error("All SMS retry attempts exhausted for {}: {}", to, e.getMessage());
        throw new RuntimeException("SMS delivery failed after retries: " + e.getMessage(), e);
    }

    // ---- WhatsApp ----
    @Retryable(retryFor = Exception.class, maxAttempts = 3,
               backoff = @Backoff(delay = 2000, multiplier = 2))
    public String sendWhatsApp(String to, String body) {
        log.info("Sending WhatsApp to {}", to);
        String formattedTo = to.startsWith("whatsapp:") ? to : "whatsapp:" + to;

        MessageCreator creator;
        String msid = twilioConfig.getMessagingServiceSid();
        if (StringUtils.hasText(msid)) {
            creator = Message.creator(new PhoneNumber(formattedTo), msid, body);
        } else {
            creator = Message.creator(new PhoneNumber(formattedTo), new PhoneNumber(twilioConfig.getWhatsAppNumber()), body);
        }

        Message message = creator.create();
        log.info("WhatsApp sent – SID: {}", message.getSid());
        return message.getSid();
    }

    @Recover
    public String recoverWhatsApp(Exception e, String to, String body) {
        log.error("All WhatsApp retry attempts exhausted for {}: {}", to, e.getMessage());
        throw new RuntimeException("WhatsApp delivery failed after retries: " + e.getMessage(), e);
    }

    // ---- Voice Call ----
    @Retryable(retryFor = Exception.class, maxAttempts = 3,
               backoff = @Backoff(delay = 3000, multiplier = 2))
    public String makeVoiceCall(String to, String twimlMessage) {
        log.info("Initiating voice call to {}", to);
        String twiml = "<Response><Say voice=\"alice\">" + twimlMessage + "</Say></Response>";
        // Voice calls always use the caller phone number (no MessagingServiceSid for calls)
        Call call = Call.creator(
                new PhoneNumber(to),
                new PhoneNumber(twilioConfig.getPhoneNumber()),
                new Twiml(twiml)
        ).create();
        log.info("Voice call initiated – SID: {}", call.getSid());
        return call.getSid();
    }

    @Recover
    public String recoverVoiceCall(Exception e, String to, String twimlMessage) {
        log.error("All voice call retry attempts exhausted for {}: {}", to, e.getMessage());
        throw new RuntimeException("Voice call failed after retries: " + e.getMessage(), e);
    }
}
