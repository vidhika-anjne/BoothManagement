package com.diamond.backend.controller;

import com.diamond.backend.model.*;
import com.diamond.backend.service.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/superadmin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(superAdminService.getDashboardStats());
    }

    @GetMapping("/booths")
    public ResponseEntity<List<BoothPart>> getBooths() {
        return ResponseEntity.ok(superAdminService.getAllBooths());
    }

    @GetMapping("/sections")
    public ResponseEntity<List<BoothSection>> getSections() {
        return ResponseEntity.ok(superAdminService.getAllSections());
    }

    @GetMapping("/voters")
    public ResponseEntity<List<Voter>> getVoters(
            @RequestParam(required = false) String partId,
            @RequestParam(required = false) String sectionId,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) CasteCategory casteCategory) {
        return ResponseEntity.ok(superAdminService.getVoters(partId, sectionId, gender, casteCategory));
    }

    @GetMapping("/schemes")
    public ResponseEntity<List<Scheme>> getSchemes() {
        return ResponseEntity.ok(superAdminService.getAllSchemes());
    }

    // ── Hierarchy & Segmentation ──────────────────────────────────────────

    @GetMapping("/segments/districts")
    public ResponseEntity<List<String>> getDistricts() {
        return ResponseEntity.ok(superAdminService.getDistricts());
    }

    @GetMapping("/segments/acs")
    public ResponseEntity<List<String>> getAcs(@RequestParam String district) {
        return ResponseEntity.ok(superAdminService.getAcs(district));
    }

    @GetMapping("/segments/parts")
    public ResponseEntity<List<Map<String, Object>>> getParts(@RequestParam String ac) {
        return ResponseEntity.ok(superAdminService.getParts(ac));
    }

    @GetMapping("/dashboard/segmentation")
    public ResponseEntity<Map<String, Object>> getSegmentation(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String ac,
            @RequestParam(required = false) Integer partNumber) {
        return ResponseEntity.ok(superAdminService.getHierarchicalSegmentation(district, ac, partNumber));
    }

    @GetMapping("/voter-stats")
    public ResponseEntity<Map<String, Object>> getVoterStats(
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String caste) {
        return ResponseEntity.ok(superAdminService.getVoterStats(ageGroup, gender, caste));
    }
}
