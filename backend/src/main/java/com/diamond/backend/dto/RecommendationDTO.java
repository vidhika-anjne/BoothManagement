package com.diamond.backend.dto;

/**
 * Data Transfer Object representing a single scheme recommendation result.
 */
public class RecommendationDTO {

    private Long schemeId;
    private String schemeName;
    private double matchScore;
    private String matchReason;
    private java.util.List<String> reasons;
    private String eligibilityStatus;

    public RecommendationDTO() {
        this.reasons = new java.util.ArrayList<>();
    }

    public Long getSchemeId() { return schemeId; }
    public void setSchemeId(Long schemeId) { this.schemeId = schemeId; }

    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public java.util.List<String> getReasons() { return reasons; }
    public void setReasons(java.util.List<String> reasons) { this.reasons = reasons; }

    public String getEligibilityStatus() { return eligibilityStatus; }
    public void setEligibilityStatus(String eligibilityStatus) { this.eligibilityStatus = eligibilityStatus; }
}
