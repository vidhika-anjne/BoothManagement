package com.diamond.backend.controller;

import com.diamond.backend.model.User;
import com.diamond.backend.service.DashboardService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final DashboardService dashboardService;

    public AuthController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String boothId = credentials.get("boothId");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        // Dynamic Login: Any credentials work. If not in DB, create it.
        Long pid = null;
        try {
            if (boothId != null && !boothId.isEmpty()) pid = Long.valueOf(boothId);
        } catch (NumberFormatException ignored) {}

        User user = dashboardService.getOrCreateUser(email, password, pid);

        session.setAttribute("userEmail", user.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "user", Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "boothId", user.getPartId() != null ? user.getPartId() : "N/A"
            )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }
}
