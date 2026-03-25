package com.diamond.backend.controller;

import com.diamond.backend.model.Notification;
import com.diamond.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Send notification through specified channels
     * POST /api/notifications
     * Body:
     * {
     *   "title": "Road Fixed",
     *   "messageBody": "Street lights repaired at Gandhi Chowk",
     *   "type": "Resolved",
     *   "boothId": 141,
     *   "area": "Gandhi Chowk",
     *   "linkedIssueId": 1,
     *   "responsibleDepartment": "PWD",
     *   "estimatedRecipients": 800,
     *   "visualType": "before-after",
     *   "beforeDescription": "6 street lights non-functional since Feb 26",
     *   "afterDescription": "All lights repaired and commissioned",
     *   "channels": ["SMS", "WhatsApp", "App", "Voice"]
     * }
     */
    @PostMapping
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        Notification sent = notificationService.sendNotification(notification);
        return ResponseEntity.ok(sent);
    }
    
    /**
     * Get all notifications with filters
     * GET /api/notifications?status=SENT&boothId=141
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long boothId) {
        
        List<Notification> notifications;
        
        if (boothId != null) {
            notifications = notificationService.getNotificationsByBooth(boothId);
        } else {
            notifications = notificationService.getAllNotifications();
        }
        
        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            notifications = notifications.stream()
                    .filter(n -> n.getStatus().equals(status))
                    .toList();
        }
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get notification by ID
     * GET /api/notifications/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        return notificationService.getAllNotifications().stream()
                .filter(n -> n.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get notification statistics - for dashboard KPIs
     * GET /api/notifications/analytics/stats
     */
    @GetMapping("/analytics/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(notificationService.getStatistics());
    }
    
    /**
     * Get notifications by booth - for booth admin
     * GET /api/booths/:boothId/notifications
     */
    @GetMapping("/booth/{boothId}")
    public ResponseEntity<List<Notification>> getBoothNotifications(@PathVariable Long boothId) {
        return ResponseEntity.ok(notificationService.getNotificationsByBooth(boothId));
    }
    
    /**
     * Delete notification (soft delete optional)
     * DELETE /api/notifications/:id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        // Implementation for deletion
        return ResponseEntity.ok().build();
    }
}
