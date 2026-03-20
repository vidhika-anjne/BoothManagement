package com.diamond.backend.service;

import com.diamond.backend.dto.RecommendationDTO;
import com.diamond.backend.model.Scheme;
import com.diamond.backend.model.Voter;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Deterministic Scheme Recommendation Engine.
 *
 * <p>Algorithm overview:
 * <ol>
 *   <li>Extract a {@code Set<String>} of semantic roles from the voter profile.</li>
 *   <li>For every scheme, score how well the scheme's beneficiary list overlaps with those roles.</li>
 *   <li>Normalise the raw score and discard schemes below the relevance threshold.</li>
 *   <li>Return the top-5 results sorted by descending score.</li>
 * </ol>
 *
 * <p>No LLM is used at runtime – all logic is deterministic Java.
 */
@Service
public class SchemeRecommendationService {

    // ── Scoring weights ───────────────────────────────────────────────────────

    private static final int WEIGHT_DIRECT_MATCH     = 4;  // voter role == scheme beneficiary (exact/strong)
    private static final int WEIGHT_OCCUPATION_MATCH  = 3;  // occupation-derived role
    private static final int WEIGHT_SOCIO_MATCH       = 2;  // caste / income / minority
    private static final int WEIGHT_EMPLOYMENT_MATCH  = 2;  // unemployment / self-employment
    private static final int WEIGHT_UNIVERSAL_MATCH   = 2;  // citizen/universal
    private static final int WEIGHT_AGE_MATCH         = 1;  // age band relevance

    /** Theoretical maximum possible score per scheme (used for normalisation). */
    private static final double MAX_POSSIBLE_SCORE = WEIGHT_DIRECT_MATCH
            + WEIGHT_OCCUPATION_MATCH
            + WEIGHT_SOCIO_MATCH
            + WEIGHT_EMPLOYMENT_MATCH
            + WEIGHT_UNIVERSAL_MATCH
            + WEIGHT_AGE_MATCH;   // = 14.0

    /** Minimum normalised score a scheme must exceed to be included. */
    private static final double SCORE_THRESHOLD = 0.2;

    /** Maximum number of recommendations returned. */
    private static final int MAX_RESULTS = 5;

    // ── Partial-match alias map ───────────────────────────────────────────────

    /**
     * Semantic aliases for expanded partial matching.
     * Key   = canonical voter role
     * Value = set of substrings / synonyms that appear in scheme beneficiary strings
     */
    private static final Map<String, Set<String>> SEMANTIC_ALIASES;

    static {
        SEMANTIC_ALIASES = new HashMap<>();
        // Occupation
        SEMANTIC_ALIASES.put("farmer",           Set.of("farmer", "kisan", "agriculture", "crop", "agri", "producer_org", "producer", "ryot"));
        SEMANTIC_ALIASES.put("sanitation_worker", Set.of("sanitation", "safai", "karamchari", "scavenger", "manual_scavenger"));
        SEMANTIC_ALIASES.put("vendor",            Set.of("vendor", "hawker", "street_commerce", "street_seller"));
        SEMANTIC_ALIASES.put("informal_worker",   Set.of("informal", "unorganised", "unorganized", "casual_worker", "labour", "labor", "community", "gig"));
        SEMANTIC_ALIASES.put("ex_servicemen",     Set.of("servicemen", "veteran", "ex_service", "armed_forces", "defence"));
        SEMANTIC_ALIASES.put("fishermen",         Set.of("fishermen", "fisher", "aquaculture"));
        SEMANTIC_ALIASES.put("artisan",           Set.of("artisan", "weaver", "spinner", "khadi", "coir", "handicraft"));
        SEMANTIC_ALIASES.put("construction_worker", Set.of("construction", "builder", "building_worker", "infrastructure"));
        // Socio-economic
        SEMANTIC_ALIASES.put("low_income",        Set.of("low_income", "bpl", "poor", "economically_weaker", "ews", "shg", "self_help", "women_group"));
        SEMANTIC_ALIASES.put("reserved_category", Set.of("sc", "st", "scheduled", "tribal", "dalit", "reserved", "pvtg", "dnt"));
        SEMANTIC_ALIASES.put("obc",               Set.of("obc", "backward", "other_backward"));
        SEMANTIC_ALIASES.put("minority",          Set.of("minority", "religious_minority", "linguistic_minority"));
        SEMANTIC_ALIASES.put("disabled",          Set.of("disabled", "disability", "differently_abled", "divyangjan", "pwd"));
        SEMANTIC_ALIASES.put("citizen",           Set.of("citizen", "everyone", "public", "anybody", "people", "generic"));
        // Demographics
        SEMANTIC_ALIASES.put("student",           Set.of("student", "youth", "scholarship", "education", "apprentice"));
        SEMANTIC_ALIASES.put("youth",             Set.of("youth", "young", "skill", "startup", "entrepreneur", "employment"));
        SEMANTIC_ALIASES.put("senior",            Set.of("senior", "elderly", "old_age", "pension", "aged"));
        // Employment
        SEMANTIC_ALIASES.put("unemployed",        Set.of("unemployed", "jobless", "employment", "skill", "rozgar", "rozgaar", "training"));
        SEMANTIC_ALIASES.put("self_employed",     Set.of("self_employed", "entrepreneur", "msme", "micro", "small_business", "startup"));
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Recommend schemes for a voter from the provided list.
     *
     * @param voter   the voter whose profile is used for matching
     * @param schemes the full catalogue of schemes to evaluate
     * @return up to {@value #MAX_RESULTS} ranked {@link RecommendationDTO}s
     */
    public List<RecommendationDTO> recommend(Voter voter, List<Scheme> schemes) {
        Set<String> voterRoles = extractRoles(voter);

        return schemes.stream()
                .map(scheme -> scoreScheme(voter, voterRoles, scheme))
                .filter(dto -> dto.getMatchScore() >= SCORE_THRESHOLD)
                .sorted(Comparator.comparingDouble(RecommendationDTO::getMatchScore).reversed())
                .limit(MAX_RESULTS)
                .collect(Collectors.toList());
    }

    // ── Role extraction ───────────────────────────────────────────────────────

    /**
     * Converts a Voter profile into a canonical set of semantic role strings.
     * This is the single source of truth for role derivation.
     */
    Set<String> extractRoles(Voter voter) {
        Set<String> roles = new LinkedHashSet<>();

        // — Occupation → role
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
                default -> {} // no additional role
            }
        }

        // — Employment status
        if (voter.getEmploymentStatus() != null) {
            switch (voter.getEmploymentStatus()) {
                case Unemployed    -> roles.add("unemployed");
                case Self_Employed -> roles.add("self_employed");
                default -> {}
            }
        }

        // — Student
        if (voter.isStudent()) {
            roles.add("student");
        }

        // — Low income / BPL
        if (voter.isBpl() || (voter.getAnnualIncome() != null && voter.getAnnualIncome() < 200_000)) {
            roles.add("low_income");
        }

        // — Caste category
        if (voter.getCasteCategory() != null) {
            switch (voter.getCasteCategory()) {
                case SC, ST, PVTG, DNT -> roles.add("reserved_category");
                case OBC               -> roles.add("obc");
                default -> {}
            }
        }

        // — Minority & disability
        if (voter.isMinority())  roles.add("minority");
        if (voter.isDisability()) roles.add("disabled");
        // — Always add "citizen" for universal schemes
        roles.add("citizen");
        // — Age bands
        if (voter.getAge() != null) {
            if (voter.getAge() >= 18 && voter.getAge() <= 35) roles.add("youth");
            if (voter.getAge() > 60)                          roles.add("senior");
        }

        return roles;
    }

    // ── Scoring ───────────────────────────────────────────────────────────────

    /**
     * Computes the weighted match score between a voter and a single scheme,
     * builds reasons, and returns a fully populated {@link RecommendationDTO}.
     */
    private RecommendationDTO scoreScheme(Voter voter, Set<String> voterRoles, Scheme scheme) {
        double rawScore = calculateScore(voter, voterRoles, scheme);
        double normalised = Math.min(rawScore / MAX_POSSIBLE_SCORE, 1.0);
        // round to 2 decimal places
        normalised = Math.round(normalised * 100.0) / 100.0;

        String status = normalised >= 0.65 ? "Highly Relevant" : "Relevant";
        List<String> reasons = generateReasons(voter, voterRoles, scheme);

        return new RecommendationDTO(
                scheme.getSchemeName(),
                scheme.getAbbreviation(),
                normalised,
                status,
                reasons
        );
    }

    /**
     * Computes the raw (un-normalised) weighted score for a voter-scheme pair.
     *
     * <p>Scoring tiers (non-cumulative per category, but multiple categories accumulate):
     * <ul>
     *   <li>+4 : strong direct match (occupation role ↔ scheme beneficiary)</li>
     *   <li>+3 : occupation-related semantic match</li>
     *   <li>+2 : socio-economic match (caste, income, minority)</li>
     *   <li>+2 : employment-status match</li>
     *   <li>+1 : age-band relevance</li>
     * </ul>
     */
    double calculateScore(Voter voter, Set<String> voterRoles, Scheme scheme) {
        if (scheme.getBeneficiaries() == null || scheme.getBeneficiaries().isEmpty()) {
            return 0;
        }

        double score = 0;

        // Tier 1 – direct / strong occupation match
        Set<String> occupationRoles = Set.of("farmer", "sanitation_worker", "vendor",
                "informal_worker", "ex_servicemen", "fishermen", "artisan", "construction_worker",
                "health_worker", "artist", "sportsperson", "journalist", "educator", "formal_worker");

        for (String voterRole : voterRoles) {
            if (occupationRoles.contains(voterRole)) {
                for (String beneficiary : scheme.getBeneficiaries()) {
                    if (isExactRoleMatch(voterRole, beneficiary)) {
                        score += WEIGHT_DIRECT_MATCH;
                    } else if (isSemanticMatch(voterRole, beneficiary)) {
                        score += WEIGHT_OCCUPATION_MATCH;
                    }
                }
            }
        }

        // Tier 2 – socio-economic
        Set<String> socioRoles = Set.of("low_income", "reserved_category", "obc", "minority", "disabled");
        for (String voterRole : voterRoles) {
            if (socioRoles.contains(voterRole)) {
                for (String beneficiary : scheme.getBeneficiaries()) {
                    if (matchesRole(voterRole, beneficiary)) {
                        score += WEIGHT_SOCIO_MATCH;
                    }
                }
            }
        }

        // Tier 3 – employment
        Set<String> employmentRoles = Set.of("unemployed", "self_employed");
        for (String voterRole : voterRoles) {
            if (employmentRoles.contains(voterRole)) {
                for (String beneficiary : scheme.getBeneficiaries()) {
                    if (matchesRole(voterRole, beneficiary)) {
                        score += WEIGHT_EMPLOYMENT_MATCH;
                    }
                }
            }
        }

        // Tier 4 – universal
        if (voterRoles.contains("citizen")) {
            for (String beneficiary : scheme.getBeneficiaries()) {
                if (matchesRole("citizen", beneficiary)) {
                    score += WEIGHT_UNIVERSAL_MATCH;
                }
            }
        }

        // Tier 5 – age band
        if (voter.getAge() != null && scheme.getAgeMin() != null && scheme.getAgeMax() != null) {
            if (voter.getAge() >= scheme.getAgeMin() && voter.getAge() <= scheme.getAgeMax()) {
                score += WEIGHT_AGE_MATCH;
            }
        }
        // Implicit age tier: youth / senior roles
        Set<String> ageRoles = Set.of("youth", "senior", "student");
        for (String voterRole : voterRoles) {
            if (ageRoles.contains(voterRole)) {
                for (String beneficiary : scheme.getBeneficiaries()) {
                    if (matchesRole(voterRole, beneficiary)) {
                        score += WEIGHT_AGE_MATCH;
                    }
                }
            }
        }

        return score;
    }

    // ── Matching helpers ──────────────────────────────────────────────────────

    /**
     * Checks for an exact (case-insensitive) role match.
     *
     * @param voterRole  canonical voter role
     * @param schemeRole beneficiary string from the scheme
     */
    private boolean isExactRoleMatch(String voterRole, String schemeRole) {
        return schemeRole.equalsIgnoreCase(voterRole)
                || schemeRole.toLowerCase().replace(" ", "_")
                             .equals(voterRole.toLowerCase());
    }

    /**
     * Checks whether a voter role semantically matches a scheme beneficiary string.
     * Uses the {@link #SEMANTIC_ALIASES} map for keyword expansion and falls back
     * to bidirectional substring containment.
     *
     * @param voterRole  canonical voter role (e.g. {@code "farmer"})
     * @param schemeRole beneficiary string from scheme JSON (e.g. {@code "farmer_producer_organization"})
     */
    public boolean isSemanticMatch(String voterRole, String schemeRole) {
        String normRole   = voterRole.toLowerCase().replace(" ", "_");
        String normScheme = schemeRole.toLowerCase().replace(" ", "_");

        // Exact match fast-path
        if (normRole.equals(normScheme)) return true;

        // Alias expansion
        Set<String> aliases = SEMANTIC_ALIASES.getOrDefault(normRole, Set.of());
        for (String alias : aliases) {
            if (normScheme.contains(alias)) return true;
        }

        // Bidirectional substring containment as a final fallback
        return normScheme.contains(normRole) || normRole.contains(normScheme);
    }

    /**
     * General-purpose match: exact OR semantic.
     */
    boolean matchesRole(String voterRole, String schemeRole) {
        return isExactRoleMatch(voterRole, schemeRole) || isSemanticMatch(voterRole, schemeRole);
    }

    // ── Reason generation ─────────────────────────────────────────────────────

    /**
     * Produces human-readable eligibility reasons for a voter-scheme pair.
     */
    List<String> generateReasons(Voter voter, Set<String> voterRoles, Scheme scheme) {
        List<String> reasons = new ArrayList<>();
        List<String> beneficiaries = scheme.getBeneficiaries() == null
                ? List.of() : scheme.getBeneficiaries();

        // Occupation-level reasons
        if (voterRoles.contains("farmer") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("farmer", b))) {
            reasons.add("Occupation as a farmer directly aligns with this scheme's target beneficiaries.");
        }
        if (voterRoles.contains("sanitation_worker") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("sanitation_worker", b))) {
            reasons.add("Occupation as a Safai Karamchari (sanitation worker) aligns with this scheme's target.");
        }
        if (voterRoles.contains("vendor") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("vendor", b))) {
            reasons.add("Street vendor status qualifies under this scheme's target group.");
        }
        if (voterRoles.contains("informal_worker") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("informal_worker", b))) {
            reasons.add("Unorganised/informal worker status is covered by this scheme.");
        }
        if (voterRoles.contains("ex_servicemen") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("ex_servicemen", b))) {
            reasons.add("Ex-servicemen status is directly targeted by this scheme.");
        }
        if (voterRoles.contains("fishermen") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("fishermen", b))) {
            reasons.add("Occupation as a fisherman is relevant to this scheme's beneficiary list.");
        }
        if (voterRoles.contains("artisan") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("artisan", b))) {
            reasons.add("Artisan/weaver occupation aligns with this scheme's focus on traditional workers.");
        }
        if (voterRoles.contains("construction_worker") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("construction_worker", b))) {
            reasons.add("Construction worker background is covered by this scheme.");
        }

        // Socio-economic reasons
        if (voterRoles.contains("low_income")) {
            boolean bplMatch = beneficiaries.stream().anyMatch(b -> matchesRole("low_income", b));
            if (bplMatch) {
                if (voter.isBpl()) {
                    reasons.add("BPL (Below Poverty Line) card holder — meets low-income eligibility.");
                } else {
                    reasons.add("Annual income below ₹2,00,000 qualifies under the low-income criterion.");
                }
            }
        }
        if (voterRoles.contains("reserved_category") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("reserved_category", b))) {
            reasons.add("Caste category (" + voter.getCasteCategory() + ") qualifies under scheduled/reserved group schemes.");
        }
        if (voterRoles.contains("obc") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("obc", b))) {
            reasons.add("OBC classification makes this voter eligible for Other Backward Class schemes.");
        }
        if (voterRoles.contains("minority") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("minority", b))) {
            reasons.add("Minority status increases relevance for this scheme.");
        }
        if (voterRoles.contains("disabled") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("disabled", b))) {
            reasons.add("Disability status (Divyangjan) qualifies under this scheme.");
        }

        // Employment reasons
        if (voterRoles.contains("unemployed") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("unemployed", b))) {
            reasons.add("Unemployed status aligns with this scheme's employment/skilling focus.");
        }
        if (voterRoles.contains("self_employed") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("self_employed", b))) {
            reasons.add("Self-employed status is relevant to this entrepreneurship/MSME scheme.");
        }

        // Demographic reasons
        if (voterRoles.contains("student") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("student", b))) {
            reasons.add("Student status is covered by this education or scholarship scheme.");
        }
        if (voterRoles.contains("youth") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("youth", b))) {
            reasons.add("Age group (18–35) qualifies as 'youth' under this scheme.");
        }
        if (voterRoles.contains("senior") && beneficiaries.stream()
                .anyMatch(b -> matchesRole("senior", b))) {
            reasons.add("Age above 60 qualifies under senior citizen / pension schemes.");
        }

        // Age range reason
        if (voter.getAge() != null && scheme.getAgeMin() != null && scheme.getAgeMax() != null
                && voter.getAge() >= scheme.getAgeMin() && voter.getAge() <= scheme.getAgeMax()) {
            reasons.add("Voter age (" + voter.getAge() + ") falls within the scheme's specified age range ("
                    + scheme.getAgeMin() + "–" + scheme.getAgeMax() + ").");
        }

        // Fallback: avoid empty reason list
        if (reasons.isEmpty()) {
            reasons.add("Profile partially matches scheme beneficiary criteria.");
        }

        return reasons;
    }
}
