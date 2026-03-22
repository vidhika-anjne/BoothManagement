package com.diamond.backend.controller;

import com.diamond.backend.model.BoothSection;
import com.diamond.backend.model.Scheme;
import com.diamond.backend.model.Voter;
import com.diamond.backend.service.SuperAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/superadmin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(superAdminService.getDashboardStats());
    }

    @GetMapping("/booths")
    public ResponseEntity<List<Map<String, Object>>> getAllBooths() {
        return ResponseEntity.ok(superAdminService.getAllBooths());
    }

    @GetMapping("/sections")
    public ResponseEntity<List<BoothSection>> getSections(@RequestParam(required = false) Long boothId) {
        return ResponseEntity.ok(superAdminService.getSections(boothId));
    }

    @GetMapping("/voters")
    public ResponseEntity<List<Voter>> getVoters(
            @RequestParam(required = false) String boothId,
            @RequestParam(required = false) String sectionId,
            @RequestParam(required = false) Voter.Gender gender,
            @RequestParam(required = false) Voter.CasteCategory casteCategory) {
        return ResponseEntity.ok(superAdminService.getVoters(boothId, sectionId, gender, casteCategory));
    }

    @GetMapping("/schemes")
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(superAdminService.getAllSchemes());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(superAdminService.getAnalytics());
    }

    // ── Legacy segmentation (kept for backward compat) ─────────────────────
    @GetMapping("/segmentation")
    public ResponseEntity<Object> getSegmentationData(
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String occupation,
            @RequestParam(required = false, defaultValue = "overall") String view) {
        return ResponseEntity.ok(superAdminService.getSegmentationData(ageGroup, gender, occupation, view));
    }

    // ── NEW: Hierarchical segmentation ─────────────────────────────────────
    /**
     * GET /superadmin/dashboard/segmentation
     * Params: district, ac, partNumber (all optional, cascading)
     * Case 1: no params   → All Delhi (hardcoded constants)
     * Case 2: ac = "Delhi Cantt" → real DB query
     * Case 3: anything else   → deterministic mock data
     */
    @GetMapping("/dashboard/segmentation")
    public ResponseEntity<Map<String, Object>> getHierarchicalSegmentation(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String ac,
            @RequestParam(required = false) Integer partNumber) {
        return ResponseEntity.ok(superAdminService.getHierarchicalSegmentation(district, ac, partNumber));
    }

    // ── NEW: Hierarchy dropdown endpoints ──────────────────────────────────
    /** Returns list of distinct district names */
    @GetMapping("/segments/districts")
    public ResponseEntity<List<String>> getDistricts() {
        return ResponseEntity.ok(superAdminService.getDistinctDistricts());
    }

    /** Returns AC names for a given district */
    @GetMapping("/segments/acs")
    public ResponseEntity<List<String>> getAcs(
            @RequestParam String district) {
        return ResponseEntity.ok(superAdminService.getAcsByDistrict(district));
    }

    /** Returns part number + name list for a given AC */
    @GetMapping("/segments/parts")
    public ResponseEntity<List<Map<String, Object>>> getParts(
            @RequestParam String ac) {
        return ResponseEntity.ok(superAdminService.getPartsByAc(ac));
    }
}
