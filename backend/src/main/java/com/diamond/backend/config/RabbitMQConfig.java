package com.diamond.backend.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ---- Exchange ----
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String RETRY_EXCHANGE        = "notification.retry.exchange";

    // ---- Queues ----
    public static final String SMS_QUEUE       = "notification.sms";
    public static final String WHATSAPP_QUEUE  = "notification.whatsapp";
    public static final String VOICE_QUEUE     = "notification.voice";
    public static final String RETRY_QUEUE     = "notification.retry";
    public static final String DEAD_LETTER_QUEUE = "notification.dead-letter";

    // ---- Routing Keys ----
    public static final String SMS_ROUTING_KEY      = "notification.sms";
    public static final String WHATSAPP_ROUTING_KEY = "notification.whatsapp";
    public static final String VOICE_ROUTING_KEY    = "notification.voice";
    public static final String RETRY_ROUTING_KEY    = "notification.retry";

    // ---- Exchange Beans ----
    @Bean
    public TopicExchange notificationExchange() {
        return ExchangeBuilder.topicExchange(NOTIFICATION_EXCHANGE).durable(true).build();
    }

    @Bean
    public DirectExchange retryExchange() {
        return ExchangeBuilder.directExchange(RETRY_EXCHANGE).durable(true).build();
    }

    // ---- Queue Beans ----
    @Bean
    public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE)
                .withArgument("x-dead-letter-exchange", RETRY_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", RETRY_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue whatsAppQueue() {
        return QueueBuilder.durable(WHATSAPP_QUEUE)
                .withArgument("x-dead-letter-exchange", RETRY_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", RETRY_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue voiceQueue() {
        return QueueBuilder.durable(VOICE_QUEUE)
                .withArgument("x-dead-letter-exchange", RETRY_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", RETRY_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue retryQueue() {
        return QueueBuilder.durable(RETRY_QUEUE)
                .withArgument("x-message-ttl", 60000) // 1 minute TTL before re-enqueue
                .withArgument("x-dead-letter-exchange", NOTIFICATION_EXCHANGE)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DEAD_LETTER_QUEUE).build();
    }

    // ---- Bindings ----
    @Bean
    public Binding smsBinding(Queue smsQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(smsQueue).to(notificationExchange).with(SMS_ROUTING_KEY);
    }

    @Bean
    public Binding whatsAppBinding(Queue whatsAppQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(whatsAppQueue).to(notificationExchange).with(WHATSAPP_ROUTING_KEY);
    }

    @Bean
    public Binding voiceBinding(Queue voiceQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(voiceQueue).to(notificationExchange).with(VOICE_ROUTING_KEY);
    }

    @Bean
    public Binding retryBinding(Queue retryQueue, DirectExchange retryExchange) {
        return BindingBuilder.bind(retryQueue).to(retryExchange).with(RETRY_ROUTING_KEY);
    }

    // ---- Converter & Template ----
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        template.setMandatory(true);
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter());
        factory.setDefaultRequeueRejected(false); // send to DLQ on rejection
        factory.setConcurrentConsumers(3);
        factory.setMaxConcurrentConsumers(10);
        return factory;
    }
}
