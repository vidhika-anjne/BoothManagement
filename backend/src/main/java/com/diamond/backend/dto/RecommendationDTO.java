package com.diamond.backend.dto;

import java.util.List;

/**
 * Data Transfer Object representing a single scheme recommendation result.
 * Returned by {@link com.diamond.backend.service.SchemeRecommendationService}.
 */
public class RecommendationDTO {

    private String schemeName;
    private String abbreviation;
    private double matchScore;          // normalised 0.0 – 1.0
    private String eligibilityStatus;   // "Highly Relevant" | "Relevant"
    private List<String> reasons;

    // ── Constructors ──────────────────────────────────────────────────────────

    public RecommendationDTO() {}

    public RecommendationDTO(String schemeName, String abbreviation,
                             double matchScore, String eligibilityStatus,
                             List<String> reasons) {
        this.schemeName        = schemeName;
        this.abbreviation      = abbreviation;
        this.matchScore        = matchScore;
        this.eligibilityStatus = eligibilityStatus;
        this.reasons           = reasons;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getSchemeName()                    { return schemeName; }
    public void   setSchemeName(String schemeName)   { this.schemeName = schemeName; }

    public String getAbbreviation()                      { return abbreviation; }
    public void   setAbbreviation(String abbreviation)   { this.abbreviation = abbreviation; }

    public double getMatchScore()                    { return matchScore; }
    public void   setMatchScore(double matchScore)   { this.matchScore = matchScore; }

    public String getEligibilityStatus()                         { return eligibilityStatus; }
    public void   setEligibilityStatus(String eligibilityStatus) { this.eligibilityStatus = eligibilityStatus; }

    public List<String> getReasons()                     { return reasons; }
    public void         setReasons(List<String> reasons) { this.reasons = reasons; }
}
