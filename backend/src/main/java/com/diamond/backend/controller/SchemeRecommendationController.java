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
import java.util.Optional;

/**
 * REST controller that exposes the Scheme Recommendation Engine.
 *
 * <pre>
 * GET  /api/recommendations/{voterId}   – recommendations for an existing voter
 * POST /api/recommendations/preview     – recommendations for an ad-hoc voter object
 * </pre>
 *
 * Returns up to 5 ranked scheme recommendations for the specified voter.
 */
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class SchemeRecommendationController {

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private SchemeRecommendationService recommendationService;

    /**
     * Returns scheme recommendations for a voter identified by their EPIC voter ID.
     *
     * @param voterId the voter's EPIC ID (e.g. "XYZ1234567")
     * @return 200 with list of {@link RecommendationDTO}, or 404 if voter not found
     */
    @GetMapping("/{voterId}")
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(
            @PathVariable String voterId) {

        Optional<Voter> voterOpt = voterRepository.findByVoterId(voterId);
        if (voterOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Scheme> allSchemes = schemeRepository.findAll();
        List<RecommendationDTO> recommendations = recommendationService.recommend(voterOpt.get(), allSchemes);

        return ResponseEntity.ok(recommendations);
    }

    /**
     * Accepts a complete Voter object in the request body and returns recommendations.
     * Useful for previewing recommendations before a voter profile is persisted.
     *
     * @param voter  the voter profile (may not yet exist in the database)
     * @return 200 with list of {@link RecommendationDTO}
     */
    @PostMapping("/preview")
    public ResponseEntity<List<RecommendationDTO>> previewRecommendations(
            @RequestBody Voter voter) {

        List<Scheme> allSchemes = schemeRepository.findAll();
        List<RecommendationDTO> recommendations = recommendationService.recommend(voter, allSchemes);

        return ResponseEntity.ok(recommendations);
    }
}
