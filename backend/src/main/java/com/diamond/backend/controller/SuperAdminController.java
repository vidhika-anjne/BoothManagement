package com.diamond.backend.controller;

import com.diamond.backend.model.BoothPart;
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

    @GetMapping("/segmentation")
    public ResponseEntity<Object> getSegmentationData(
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String occupation,
            @RequestParam(required = false, defaultValue = "overall") String view) {
        return ResponseEntity.ok(superAdminService.getSegmentationData(ageGroup, gender, occupation, view));
    }

    @GetMapping("/dashboard/segmentation")
    public ResponseEntity<Map<String, Object>> getDashboardSegmentation(
            @RequestParam(required = false, defaultValue = "overall") String view,
            @RequestParam(required = false) Integer partNumber,
            @RequestParam(required = false) String acName) {
        return ResponseEntity.ok(superAdminService.getDashboardSegmentation(view, partNumber, acName));
    }
}
