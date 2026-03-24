package com.diamond.backend.controller;

import com.diamond.backend.model.Feedback;
import com.diamond.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@RestController
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SimpMessagingTemplate messagingTemplate;

    public DashboardController(DashboardService dashboardService,
                                SimpMessagingTemplate messagingTemplate) {
        this.dashboardService = dashboardService;
        this.messagingTemplate = messagingTemplate;
    }

    // ── KPI Stats ────────────────────────────────────────────────────────────
    @GetMapping("/api/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    // ── Dynamic Voter Segmentation ───────────────────────────────────────────
    @GetMapping("/api/voters/segments")
    public ResponseEntity<List<Map<String, Object>>> getVoterSegments(
            @RequestParam("filter") String filter) {
        return ResponseEntity.ok(dashboardService.getVoterSegments(filter));
    }

    // ── Booth Parts Distribution ─────────────────────────────────────────────
    @GetMapping("/api/dashboard/booth-parts")
    public ResponseEntity<List<Map<String, Object>>> getBoothParts() {
        return ResponseEntity.ok(dashboardService.getBoothParts());
    }

    // ── Booth Performance ────────────────────────────────────────────────────
    @GetMapping("/api/booths/performance")
    public ResponseEntity<List<Map<String, Object>>> getBoothPerformance() {
        return ResponseEntity.ok(dashboardService.getBoothPerformance());
    }

    // ── Issue Distribution ───────────────────────────────────────────────────
    @GetMapping("/api/issues/distribution")
    public ResponseEntity<Map<String, Object>> getIssueDistribution(
            @RequestParam("detailed") Optional<Boolean> detailed) {
        return ResponseEntity.ok(dashboardService.getIssueDistribution(detailed.orElse(false)));
    }

    // ── Feedback ─────────────────────────────────────────────────────────────
    @PostMapping("/api/feedback")
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Map<String, Object> body) {
        String author  = body.get("author") != null ? body.get("author").toString() : "Anonymous";
        String message = body.get("message") != null ? body.get("message").toString() : "";
        String boothId = body.get("boothId") != null ? body.get("boothId").toString() : null;

        Feedback fb = new Feedback(author, message, boothId);
        Feedback saved = dashboardService.saveFeedback(fb);

        // Broadcast updated feedback list to all connected clients (async/safe)
        try {
            messagingTemplate.convertAndSend("/topic/feedback",
                    dashboardService.getAllFeedback());
        } catch (Exception e) {
            // Log or ignore — don't fail the rest of the transaction
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/api/feedback")
    public ResponseEntity<List<Feedback>> getFeedback() {
        return ResponseEntity.ok(dashboardService.getAllFeedback());
    }

    @DeleteMapping("/api/feedback/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        dashboardService.deleteFeedback(id);
        
        // Broadcast updated feedback list
        try {
            messagingTemplate.convertAndSend("/topic/feedback", 
                dashboardService.getAllFeedback());
        } catch (Exception ignored) {}
        
        return ResponseEntity.noContent().build();
    }

    // ── User Profile ─────────────────────────────────────────────────────────
    @GetMapping("/api/user/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(jakarta.servlet.http.HttpSession session) {
        String sessionEmail = (String) session.getAttribute("userEmail");
        return ResponseEntity.ok(dashboardService.getUserProfile(sessionEmail));
    }

    // ── Scheduled Broadcast (every 2 seconds) ───────────────────────────────
    @Scheduled(fixedRate = 2_000, initialDelay = 5_000)
    public void broadcastDashboardStats() {
        try {
            messagingTemplate.convertAndSend("/topic/dashboard", Map.of(
                "stats", dashboardService.getDashboardStats(),
                "performance", dashboardService.getBoothPerformance()
            ));
        } catch (Exception ignored) {
            // WebSocket might not be connected during startup
        }
    }
}
