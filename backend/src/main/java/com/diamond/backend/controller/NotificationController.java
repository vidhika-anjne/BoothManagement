package com.diamond.backend.controller;

import com.diamond.backend.dto.BulkNotificationRequestDTO;
import com.diamond.backend.dto.NotificationRequestDTO;
import com.diamond.backend.dto.NotificationResponseDTO;
import com.diamond.backend.model.NotificationChannel;
import com.diamond.backend.model.NotificationStatus;
import com.diamond.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ---- Send single notification ----
    @PostMapping("/send")
    public ResponseEntity<NotificationResponseDTO> sendNotification(
            @Valid @RequestBody NotificationRequestDTO request) {
        NotificationResponseDTO response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ---- Send bulk notifications ----
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> sendBulkNotifications(
            @Valid @RequestBody BulkNotificationRequestDTO request) {
        Map<String, Object> result = notificationService.sendBulkNotifications(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(result);
    }

    // ---- Get all notifications (paginated) ----
    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getAllNotifications(pageable));
    }

    // ---- Get by ID ----
    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> getById(@PathVariable Long id) {
        return notificationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ---- Get by voter ----
    @GetMapping("/voter/{voterId}")
    public ResponseEntity<Page<NotificationResponseDTO>> getByVoter(
            @PathVariable Long voterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getByVoterId(voterId, pageable));
    }

    // ---- Batch status ----
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<NotificationResponseDTO>> getBatchStatus(
            @PathVariable String batchId) {
        return ResponseEntity.ok(notificationService.getBatchStatus(batchId));
    }

    // ---- Dashboard stats ----
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(notificationService.getDashboardStats());
    }

    // ---- Trigger manual retry ----
    @PostMapping("/retry")
    public ResponseEntity<Map<String, String>> triggerRetry() {
        notificationService.retryFailedNotifications();
        return ResponseEntity.ok(Map.of("message", "Retry job triggered successfully"));
    }
}
