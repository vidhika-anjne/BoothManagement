package com.diamond.backend.config;

import com.twilio.Twilio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class TwilioConfig {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String phoneNumber;

    @Value("${twilio.messaging.service.sid:}")
    private String messagingServiceSid;

    @Value("${twilio.whatsapp.number:whatsapp:+14155238886}")
    private String whatsAppNumber;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    public String getAccountSid()          { return accountSid; }
    public String getAuthToken()           { return authToken; }
    public String getPhoneNumber()         { return phoneNumber; }
    public String getMessagingServiceSid() { return messagingServiceSid; }
    public String getWhatsAppNumber()      { return whatsAppNumber; }
}
