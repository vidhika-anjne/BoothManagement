package com.diamond.backend.service;

import com.diamond.backend.dto.RecommendationDTO;
import com.diamond.backend.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Deterministic Scheme Recommendation Engine.
 * Matches Voter profile against Scheme criteria.
 */
@Service
public class SchemeRecommendationService {

    private static final int WEIGHT_DIRECT_MATCH     = 4;
    private static final int WEIGHT_OCCUPATION_MATCH  = 3;
    private static final int WEIGHT_AGE_MATCH         = 1;
    private static final int WEIGHT_GENDER_MATCH      = 2;

    private static final double SCORE_THRESHOLD = 0.2;
    private static final int MAX_RESULTS = 5;

    private static final Map<String, Set<String>> SEMANTIC_ALIASES = new HashMap<>();

    static {
        SEMANTIC_ALIASES.put("farmer",            Set.of("farmer", "agriculture", "kisan", "cultivator"));
        SEMANTIC_ALIASES.put("sanitation_worker", Set.of("safai", "sweeper", "sanitation", "cleaner"));
        SEMANTIC_ALIASES.put("vendor",            Set.of("vendor", "street", "rehri", "patri", "seller"));
        SEMANTIC_ALIASES.put("informal_worker",   Set.of("unorganized", "laborer", "mazdoor", "daily_wager"));
        SEMANTIC_ALIASES.put("self_employed",     Set.of("self_employed", "entrepreneur", "msme", "micro", "small_business", "startup"));
    }

    public List<RecommendationDTO> recommend(Voter voter, List<Scheme> schemes) {
        Set<String> voterRoles = extractRoles(voter);

        return schemes.stream()
                .map(scheme -> scoreScheme(voter, voterRoles, scheme))
                .filter(dto -> dto.getMatchScore() >= SCORE_THRESHOLD)
                .sorted(Comparator.comparingDouble(RecommendationDTO::getMatchScore).reversed())
                .limit(MAX_RESULTS)
                .collect(Collectors.toList());
    }

    Set<String> extractRoles(Voter voter) {
        if (voter == null) return Collections.emptySet();
        Set<String> roles = new LinkedHashSet<>();

        if (voter.getOccupation() != null) {
            switch (voter.getOccupation()) {
                case FARMER                       -> roles.add("farmer");
                case SAFAI_KARAMCHARI             -> roles.add("sanitation_worker");
                case STREET_VENDOR                -> roles.add("vendor");
                case UNORGANIZED_WORKER           -> roles.add("informal_worker");
                case EX_SERVICEMEN                -> roles.add("ex_servicemen");
                case FISHERMEN                    -> roles.add("fishermen");
                case ARTISANS_SPINNERS_AND_WEAVERS-> roles.add("artisan");
                case KHADI_ARTISAN                -> roles.add("artisan");
                case COIR_WORKER                  -> roles.add("artisan");
                case CONSTRUCTION_WORKER          -> roles.add("construction_worker");
                case HEALTH_WORKER                -> roles.add("health_worker");
                case ARTIST                       -> roles.add("artist");
                case SPORTSPERSON                 -> roles.add("sportsperson");
                case JOURNALIST                   -> roles.add("journalist");
                case TEA_AND_EX_TEA_GARDEN_TRIBES -> roles.add("informal_worker");
                case TEACHER_OR_FACULTY           -> roles.add("educator");
                case ORGANIZED_WORKER             -> roles.add("formal_worker");
                default -> {}
            }
        }

        if (voter.getEmploymentStatus() != null) {
            switch (voter.getEmploymentStatus()) {
                case Unemployed    -> roles.add("unemployed");
                case Self_Employed -> roles.add("self_employed");
                case Student       -> roles.add("student");
                case Employed      -> roles.add("employed");
            }
        }

        if (voter.isStudent())  roles.add("student");
        if (voter.isBpl())      roles.add("low_income");
        if (voter.isMinority()) roles.add("minority");
        if (voter.isDisability()) roles.add("disabled");

        if (voter.getCasteCategory() != null) {
            switch (voter.getCasteCategory()) {
                case OBC                   -> roles.add("obc");
                case SC, ST, PVTG, DNT     -> roles.add("reserved_category");
                default -> {}
            }
        }

        roles.add("citizen");
        return roles;
    }

    private RecommendationDTO scoreScheme(Voter voter, Set<String> voterRoles, Scheme scheme) {
        RecommendationDTO dto = new RecommendationDTO();
        dto.setSchemeId(scheme.getId());
        dto.setSchemeName(scheme.getSchemeName());
        
        List<String> reasons = new java.util.ArrayList<>();
        double rawScore = calculateScore(voter, voterRoles, scheme, reasons);
        
        // Normalize score (max around 10-12, let's scale to 1.0)
        double normalized = Math.min(rawScore / 10.0, 1.0);
        dto.setMatchScore(normalized);
        dto.setReasons(reasons);
        dto.setMatchReason(reasons.isEmpty() ? "" : reasons.get(0));

        if (normalized >= 0.7) {
            dto.setEligibilityStatus("Highly Relevant");
        } else {
            dto.setEligibilityStatus("Relevant");
        }
        
        return dto;
    }

    double calculateScore(Voter voter, Set<String> voterRoles, Scheme scheme, List<String> reasons) {
        if (scheme.getBeneficiaries() == null || scheme.getBeneficiaries().isEmpty()) return 0;

        double score = 0;

        for (String voterRole : voterRoles) {
            for (String beneficiary : scheme.getBeneficiaries()) {
                if (isExactRoleMatch(voterRole, beneficiary)) {
                    score += WEIGHT_DIRECT_MATCH;
                    reasons.add("Matches beneficiary criteria: " + beneficiary);
                } else if (isSemanticMatch(voterRole, beneficiary)) {
                    score += WEIGHT_OCCUPATION_MATCH;
                    reasons.add("Fits profile category: " + beneficiary);
                }
            }
        }

        // Age criteria
        if (voter.getAge() != null && scheme.getAgeMin() != null && scheme.getAgeMax() != null) {
            if (voter.getAge() >= scheme.getAgeMin() && voter.getAge() <= scheme.getAgeMax()) {
                score += WEIGHT_AGE_MATCH;
                reasons.add("Meets age requirement (" + scheme.getAgeMin() + "-" + scheme.getAgeMax() + ")");
            }
        }

        // Gender criteria
        if (scheme.getGender() != null && !scheme.getGender().isEmpty() && voter.getGender() != null) {
            String voterGender = voter.getGender().name().toLowerCase();
            for (String g : scheme.getGender()) {
                if (g != null && g.toLowerCase().contains(voterGender)) {
                    score += WEIGHT_GENDER_MATCH;
                    reasons.add("Matches targeted gender: " + g);
                }
            }
        }

        return score;
    }

    private boolean isExactRoleMatch(String voterRole, String beneficiary) {
        if (voterRole == null || beneficiary == null) return false;
        return beneficiary.toLowerCase().contains(voterRole.toLowerCase());
    }

    private boolean isSemanticMatch(String voterRole, String beneficiary) {
        if (voterRole == null || beneficiary == null) return false;
        Set<String> aliases = SEMANTIC_ALIASES.getOrDefault(voterRole.toLowerCase(), Collections.emptySet());
        for (String alias : aliases) {
            if (alias != null && beneficiary.toLowerCase().contains(alias.toLowerCase())) return true;
        }
        return false;
    }

}
