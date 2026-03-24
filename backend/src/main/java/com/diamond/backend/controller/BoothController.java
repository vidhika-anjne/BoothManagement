package com.diamond.backend.controller;

import com.diamond.backend.service.SuperAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booths")
@CrossOrigin(origins = "*")
public class BoothController {

    private final SuperAdminService superAdminService;

    public BoothController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    @GetMapping("/parts")
    public ResponseEntity<List<Map<String, Object>>> getParts(@RequestParam String ac) {
        return ResponseEntity.ok(superAdminService.getPartsByAc(ac));
    }

    @PostMapping("/sections")
    public ResponseEntity<List<String>> getSections(@RequestBody Map<String, String> payload) {
        String ac = payload.get("ac");
        String part = payload.get("part");
        return ResponseEntity.ok(superAdminService.getSectionsByAcAndPart(ac, part));
    }
}
