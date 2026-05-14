package com.diamond.backend.controller;

import com.diamond.backend.dto.RecommendationDTO;
import com.diamond.backend.model.Scheme;
import com.diamond.backend.model.Voter;
import com.diamond.backend.repository.SchemeRepository;
import com.diamond.backend.repository.VoterRepository;
import com.diamond.backend.service.SchemeRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
@CrossOrigin(origins = "*")
public class SchemeRecommendationController {

    @Autowired
    private SchemeRecommendationService recommendationService;

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    @GetMapping("/recommend/{voterId}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(@PathVariable("voterId") String voterId) {
        Voter voter = voterRepository.findByVoterId(voterId).orElse(null);
        if (voter == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<Scheme> allSchemes = schemeRepository.findAll();
        return ResponseEntity.ok(recommendationService.recommend(voter, allSchemes));
    }

    @GetMapping
    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }
}
