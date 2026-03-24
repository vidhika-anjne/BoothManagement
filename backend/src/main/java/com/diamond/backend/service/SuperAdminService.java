package com.diamond.backend.service;

import com.diamond.backend.model.BoothPart;
import com.diamond.backend.model.BoothSection;
import com.diamond.backend.model.Scheme;
import com.diamond.backend.model.Voter;
import com.diamond.backend.repository.BoothPartRepository;
import com.diamond.backend.repository.BoothSectionRepository;
import com.diamond.backend.repository.SchemeRepository;
import com.diamond.backend.repository.VoterRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    private final BoothPartRepository boothPartRepository;
    private final BoothSectionRepository boothSectionRepository;
    private final VoterRepository voterRepository;
    private final SchemeRepository schemeRepository;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    // ── Delhi Population Constants ────────────────────────────────────────────
    // Total eligible voters (18+): ~13,700,000 (total citizens 15,524,858)
    private static final long DELHI_VOTERS      = 13_700_000L; // 18+ eligible

    // Gender (scaled to voter population ~13.7M from census)
    private static final long DELHI_MALE        = 7_368_000L;
    private static final long DELHI_FEMALE      = 6_329_000L;
    private static final long DELHI_TRANSGENDER = 1_000L;

    // Age buckets mapped to Youth(18-25) / Adult(26-50) / Senior(51+)
    // Source: 18-24:18L, 25-34:30L, 35-44:28L, 45-59:40L, 60+:21L
    private static final long DELHI_YOUTH  = 2_133_000L;
    private static final long DELHI_ADULT  = 6_800_000L;
    private static final long DELHI_SENIOR = 4_767_000L;

    // Occupation (Urban 97% → farmers ~5%, businessmen ~20%, others ~75%)
    private static final long DELHI_FARMERS     =   685_000L;
    private static final long DELHI_BUSINESSMEN = 2_740_000L;
    private static final long DELHI_OTHERS      = 10_275_000L;

    // Caste (General 45%, OBC 30%, SC 15%, ST 1% of 13.7M)
    private static final long DELHI_GENERAL = 6_165_000L;
    private static final long DELHI_OBC     = 4_110_000L;
    private static final long DELHI_SC      = 2_055_000L;
    private static final long DELHI_ST      =   137_000L;

    public SuperAdminService(
            BoothPartRepository boothPartRepository,
            BoothSectionRepository boothSectionRepository,
            VoterRepository voterRepository,
            SchemeRepository schemeRepository,
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.boothPartRepository = boothPartRepository;
        this.boothSectionRepository = boothSectionRepository;
        this.voterRepository = voterRepository;
        this.schemeRepository = schemeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // ── Dashboard Stats ───────────────────────────────────────────────────────
    public Map<String, Object> getDashboardStats() {
        List<Voter> allVoters = voterRepository.findAll();
        List<BoothPart> allBooths = boothPartRepository.findAll();
        List<Scheme> allSchemes = schemeRepository.findAll();

        long totalVoters = allVoters.size();
        long totalBooths = allBooths.size();

        long youthCount = allVoters.stream().filter(v -> v.getAge() != null && v.getAge() <= 30).count();
        long womenCount = allVoters.stream().filter(v -> v.getGender() == Voter.Gender.Female).count();
        long farmersCount = allVoters.stream().filter(v -> v.getOccupation() == Voter.Occupation.FARMER).count();
        long businessmenCount = allVoters.stream().filter(v ->
            v.getOccupation() == Voter.Occupation.ORGANIZED_WORKER ||
            v.getOccupation() == Voter.Occupation.STREET_VENDOR).count();

        long totalKeyVoters = youthCount + farmersCount + businessmenCount + womenCount;
        long totalBeneficiaries = (long) (totalVoters * 0.25);

        Map<String, Object> systemSnapshot = new HashMap<>();
        systemSnapshot.put("totalVoters", totalVoters);
        systemSnapshot.put("totalBooths", totalBooths);
        systemSnapshot.put("totalKeyVoters", totalKeyVoters);
        systemSnapshot.put("totalBeneficiaries", totalBeneficiaries);

        Map<Long, Long> boothCounts = allVoters.stream()
                .filter(v -> v.getPartId() != null)
                .collect(Collectors.groupingBy(Voter::getPartId, Collectors.counting()));

        String topBooth = "N/A";
        String weakBooth = "N/A";
        if (!boothCounts.isEmpty()) {
            Map.Entry<Long, Long> max = boothCounts.entrySet().iterator().next();
            Map.Entry<Long, Long> min = max;
            for (Map.Entry<Long, Long> entry : boothCounts.entrySet()) {
                if (entry.getValue() > max.getValue()) max = entry;
                if (entry.getValue() < min.getValue()) min = entry;
            }
            topBooth = "Part " + max.getKey();
            weakBooth = "Part " + min.getKey();
        }

        Map<String, Object> boothIntelligence = new HashMap<>();
        boothIntelligence.put("topBooth", topBooth);
        boothIntelligence.put("weakBooth", weakBooth);
        boothIntelligence.put("boothWithMaxBeneficiaries", topBooth);

        String mostPopularScheme = allSchemes.isEmpty() ? "N/A" : allSchemes.get(0).getSchemeName();
        Map<String, Object> schemeImpact = new HashMap<>();
        schemeImpact.put("totalBeneficiaries", totalBeneficiaries);
        schemeImpact.put("mostPopularScheme", mostPopularScheme);
        schemeImpact.put("schemeCoveragePercentage", 25.0);

        List<Map<String, String>> recentActivity = List.of(
            Map.of("type", "infrastructure", "title", "New road constructed", "location", "Booth 12, Gali 5", "timestamp", "2 Hours Ago"),
            Map.of("type", "scheme", "title", "Kisan Samman Nidhi rollout", "location", "District Level", "timestamp", "5 Hours Ago"),
            Map.of("type", "voter", "title", "Voter Drive Completed", "location", topBooth, "timestamp", "1 Day Ago")
        );

        Map<String, Object> response = new HashMap<>();
        response.put("systemSnapshot", systemSnapshot);
        response.put("boothIntelligence", boothIntelligence);
        response.put("schemeImpact", schemeImpact);
        response.put("recentActivity", recentActivity);
        return response;
    }

    // ── Hierarchy Endpoints ───────────────────────────────────────────────────

    /** Distinct district names from booth_parts */
    public List<String> getDistinctDistricts() {
        String sql = "SELECT DISTINCT district_name FROM booth_parts WHERE district_name IS NOT NULL ORDER BY district_name";
        return jdbcTemplate.getJdbcTemplate().queryForList(sql, String.class);
    }

    /** AC names for a given district — exact case-insensitive match to avoid cross-contamination */
    public List<String> getAcsByDistrict(String district) {
        String sql = "SELECT DISTINCT ac_name FROM booth_parts WHERE LOWER(district_name) = LOWER(:district) AND ac_name IS NOT NULL ORDER BY ac_name";
        MapSqlParameterSource params = new MapSqlParameterSource("district", district);
        return jdbcTemplate.queryForList(sql, params, String.class);
    }

    /** Parts for a given AC */
    public List<Map<String, Object>> getParts(
            @RequestParam String ac) {
        SuperAdminService superAdminService = this;
        return superAdminService.getPartsByAc(ac);
    }

    public List<Map<String, Object>> getPartsByAc(String ac) {
        return boothPartRepository.findPartsByAc(ac);
    }

    public List<String> getSectionsByAcAndPart(String ac, String part) {
        return boothSectionRepository.findSectionsByAcAndPart(ac, part);
    }

    // ── Main Segmentation Dispatcher ─────────────────────────────────────────

    public Map<String, Object> getHierarchicalSegmentation(String district, String ac, Integer partNumber) {

        boolean hasDistrict   = district   != null && !district.isBlank();
        boolean hasAc         = ac         != null && !ac.isBlank();
        boolean hasPart       = partNumber != null;
        boolean isDelhi       = !hasDistrict && !hasAc && !hasPart;
        boolean isDelhinCantt = hasAc && ac != null && ac.toLowerCase().contains("delhi cantt");

        // CASE 1: All Delhi
        if (isDelhi) {
            return buildResponse(
                DELHI_YOUTH, DELHI_ADULT, DELHI_SENIOR,
                DELHI_MALE, DELHI_FEMALE, DELHI_TRANSGENDER,
                DELHI_FARMERS, DELHI_BUSINESSMEN, DELHI_OTHERS,
                DELHI_GENERAL, DELHI_OBC, DELHI_SC, DELHI_ST,
                DELHI_VOTERS, false
            );
        }

        // CASE 2: Delhi Cantt — real data
        if (isDelhinCantt) {
            return queryRealData(partNumber);
        }

        // CASE 3: Other districts / ACs / parts — mock data
        return generateMock(district, ac, partNumber);
    }

    // ── Real DB Query (Delhi Cantt) ───────────────────────────────────────────

    private Map<String, Object> queryRealData(Integer partNumber) {
        String sumCols =
            " SUM(CASE WHEN v.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END)  AS youth," +
            " SUM(CASE WHEN v.age BETWEEN 26 AND 50 THEN 1 ELSE 0 END)  AS adult," +
            " SUM(CASE WHEN v.age > 50             THEN 1 ELSE 0 END)   AS senior," +
            " SUM(CASE WHEN v.gender = 'Male'      THEN 1 ELSE 0 END)   AS male," +
            " SUM(CASE WHEN v.gender = 'Female'    THEN 1 ELSE 0 END)   AS female," +
            " SUM(CASE WHEN v.gender NOT IN ('Male','Female') THEN 1 ELSE 0 END) AS transgender," +
            " SUM(CASE WHEN v.occupation = 'FARMER' THEN 1 ELSE 0 END)  AS farmers," +
            " SUM(CASE WHEN v.occupation IN ('ORGANIZED_WORKER','STREET_VENDOR') THEN 1 ELSE 0 END) AS businessmen," +
            " SUM(CASE WHEN v.caste_category = 'General' THEN 1 ELSE 0 END) AS caste_general," +
            " SUM(CASE WHEN v.caste_category = 'OBC'     THEN 1 ELSE 0 END) AS caste_obc," +
            " SUM(CASE WHEN v.caste_category = 'SC'      THEN 1 ELSE 0 END) AS caste_sc," +
            " SUM(CASE WHEN v.caste_category = 'ST'      THEN 1 ELSE 0 END) AS caste_st," +
            " COUNT(v.id) AS total";

        String baseWhere = " WHERE v.assembly_constituency_ac ILIKE '%Delhi Cantt%'";
        MapSqlParameterSource params = new MapSqlParameterSource();

        String joinClause = " FROM voter_profiles v" +
            " JOIN booth_parts b ON v.part_number = b.part_number" +
            "   AND TRIM(UPPER(v.assembly_constituency_ac)) = TRIM(UPPER(b.ac_name))";

        String sql;
        if (partNumber != null) {
            sql = "SELECT " + sumCols + joinClause + baseWhere + " AND v.part_number = :partNumber";
            params.addValue("partNumber", partNumber);
        } else {
            sql = "SELECT " + sumCols + " FROM voter_profiles v" + baseWhere;
        }

        try {
            return jdbcTemplate.queryForObject(sql, params, (rs, rowNum) -> {
                long total       = rs.getLong("total");
                long youth       = rs.getLong("youth");
                long adult       = rs.getLong("adult");
                long senior      = rs.getLong("senior");
                long male        = rs.getLong("male");
                long female      = rs.getLong("female");
                long transgender = rs.getLong("transgender");
                long farmers     = rs.getLong("farmers");
                long businessmen = rs.getLong("businessmen");
                long others      = Math.max(0, total - farmers - businessmen);
                long general     = rs.getLong("caste_general");
                long obc         = rs.getLong("caste_obc");
                long sc          = rs.getLong("caste_sc");
                long st          = rs.getLong("caste_st");

                // If DB returned zero data (booth has no voters), fall back to mock
                if (total == 0) {
                    return generateMock(null, "Delhi Cantt", partNumber);
                }
                return buildResponse(youth, adult, senior, male, female, transgender,
                        farmers, businessmen, others, general, obc, sc, st, total, false);
            });
        } catch (Exception e) {
            return generateMock(null, "Delhi Cantt", partNumber);
        }
    }

    // ── Deterministic Mock Generator ─────────────────────────────────────────
    // Seeded by (ac + partNumber) → same selection always gives same numbers

    private Map<String, Object> generateMock(String district, String ac, Integer partNumber) {
        String seed = (ac != null ? ac : "") + (district != null ? district : "") + (partNumber != null ? partNumber : "");
        long hash = Math.abs(seed.hashCode());
        Random rng = new Random(hash);

        // Base total depends on selection granularity
        long baseTotal;
        if (partNumber != null) {
            baseTotal = 600 + rng.nextInt(500);        // booth: 600–1100
        } else if (ac != null && !ac.isBlank()) {
            baseTotal = 40_000 + rng.nextInt(30_000);  // AC: 40k–70k
        } else {
            baseTotal = 400_000 + rng.nextInt(200_000); // district: 400k–600k
        }

        // Age ratios from Delhi data ±5% variation
        double youthRatio = jitter(rng, 0.156, 0.05); // ~15.6%
        double adultRatio = jitter(rng, 0.496, 0.05); // ~49.6%

        long youth  = Math.round(baseTotal * youthRatio);
        long adult  = Math.round(baseTotal * adultRatio);
        long senior = Math.max(0, baseTotal - youth - adult);

        // Gender ratios (Male ~53.7%, Female ~46.2%, Transgender tiny)
        double maleRatio   = jitter(rng, 0.537, 0.04);
        long male        = Math.round(baseTotal * maleRatio);
        long transgender = Math.max(1, Math.round(baseTotal * 0.00007));
        long female      = Math.max(0, baseTotal - male - transgender);

        // Occupation ratios (Farmers ~5%, Businessmen ~20%, Others ~75%)
        double farmerRatio   = jitter(rng, 0.05, 0.02);
        double businessRatio = jitter(rng, 0.20, 0.03);
        long farmers     = Math.round(baseTotal * farmerRatio);
        long businessmen = Math.round(baseTotal * businessRatio);
        long others      = Math.max(0, baseTotal - farmers - businessmen);

        // Caste: General 45%, OBC 30%, SC 15%, ST 1%
        long general = Math.round(baseTotal * jitter(rng, 0.45, 0.03));
        long obc     = Math.round(baseTotal * jitter(rng, 0.30, 0.03));
        long sc      = Math.round(baseTotal * jitter(rng, 0.15, 0.02));
        long st      = Math.max(0, baseTotal - general - obc - sc);

        return buildResponse(youth, adult, senior, male, female, transgender,
                farmers, businessmen, others, general, obc, sc, st, baseTotal, true);
    }

    /** Returns value ± (range * jitterFraction) */
    private double jitter(Random rng, double base, double range) {
        return base + (rng.nextDouble() * 2 - 1) * range;
    }

    /** Builds the standard segmentation response map */
    private Map<String, Object> buildResponse(
            long youth, long adult, long senior,
            long male, long female, long transgender,
            long farmers, long businessmen, long others,
            long general, long obc, long sc, long st,
            long total, boolean isEstimated) {

        Map<String, Object> age = new LinkedHashMap<>();
        age.put("youth",  youth);
        age.put("adult",  adult);
        age.put("senior", senior);

        Map<String, Object> gender = new LinkedHashMap<>();
        gender.put("male",        male);
        gender.put("female",      female);
        gender.put("transgender", transgender);

        Map<String, Object> occupation = new LinkedHashMap<>();
        occupation.put("farmers",     farmers);
        occupation.put("businessmen", businessmen);
        occupation.put("others",      others);

        Map<String, Object> caste = new LinkedHashMap<>();
        caste.put("general", general);
        caste.put("obc",     obc);
        caste.put("sc",      sc);
        caste.put("st",      st);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("age",        age);
        res.put("gender",     gender);
        res.put("occupation", occupation);
        res.put("caste",      caste);
        res.put("total",      total);
        res.put("isEstimated", isEstimated);
        return res;
    }

    // ── Existing methods (unchanged) ──────────────────────────────────────────

    public List<Map<String, Object>> getAllBooths() {
        String sql = "SELECT part_number, part_name, ac_name, district_name FROM booth_parts WHERE UPPER(ac_name) LIKE '%DELHI CANTT%' ORDER BY part_number";
        return jdbcTemplate.getJdbcTemplate().query(sql, (rs, rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("partNumber", rs.getInt("part_number"));
            m.put("partName", rs.getString("part_name"));
            m.put("acName", rs.getString("ac_name"));
            m.put("districtName", rs.getString("district_name"));
            return m;
        });
    }

    public List<BoothSection> getSections(Long boothId) {
        if (boothId != null) return boothSectionRepository.findByBoothPartId(boothId);
        return boothSectionRepository.findAll();
    }

    public List<Voter> getVoters(String partId, String sectionId, Voter.Gender gender, Voter.CasteCategory casteCategory) {
        Specification<Voter> spec = Specification.where(null);
        if (partId != null && !partId.isEmpty()) {
            try {
                Long partIdLong = Long.parseLong(partId);
                spec = spec.and((root, query, cb) -> cb.equal(root.get("partId"), partIdLong));
            } catch (NumberFormatException e) {
                // Invalid partId format, skip this filter
            }
        }
        if (sectionId != null && !sectionId.isEmpty())
            spec = spec.and((root, query, cb) -> cb.equal(root.get("section"), sectionId));
        if (gender != null)
            spec = spec.and((root, query, cb) -> cb.equal(root.get("gender"), gender));
        if (casteCategory != null)
            spec = spec.and((root, query, cb) -> cb.equal(root.get("casteCategory"), casteCategory));
        return voterRepository.findAll(spec);
    }

    public List<Scheme> getAllSchemes() { return schemeRepository.findAll(); }

    public Map<String, Object> getAnalytics() {
        List<Voter> allVoters = voterRepository.findAll();
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("genderDistribution", allVoters.stream()
                .filter(v -> v.getGender() != null)
                .collect(Collectors.groupingBy(v -> v.getGender().name(), Collectors.counting())));
        analytics.put("casteDistribution", allVoters.stream()
                .filter(v -> v.getCasteCategory() != null)
                .collect(Collectors.groupingBy(v -> v.getCasteCategory().name(), Collectors.counting())));
        analytics.put("votersPerBooth", allVoters.stream()
                .filter(v -> v.getPartId() != null)
                .collect(Collectors.groupingBy(Voter::getPartId, Collectors.counting())));
        analytics.put("votersPerSection", allVoters.stream()
                .filter(v -> v.getSection() != null)
                .collect(Collectors.groupingBy(Voter::getSection, Collectors.counting())));
        return analytics;
    }

    // Keep old method for backward-compat with existing old endpoint (if any)
    public Object getSegmentationData(String ageGroup, String gender, String occupation, String view) {
        StringBuilder whereClause = new StringBuilder(" WHERE v.assembly_constituency_ac ILIKE '%Delhi Cantt%'");
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (gender != null && !gender.isEmpty()) {
            whereClause.append(" AND v.gender = :gender");
            params.addValue("gender", gender);
        }
        if (occupation != null && !occupation.isEmpty()) {
            whereClause.append(" AND v.occupation = :occupation");
            params.addValue("occupation", occupation);
        }
        if (ageGroup != null && !ageGroup.isEmpty()) {
            switch (ageGroup.toLowerCase()) {
                case "youth":  whereClause.append(" AND v.age BETWEEN 18 AND 25"); break;
                case "adult":  whereClause.append(" AND v.age BETWEEN 26 AND 50"); break;
                case "senior": whereClause.append(" AND v.age > 50"); break;
            }
        }

        String sumBreakdown =
            " SUM(CASE WHEN v.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) as youth, " +
            " SUM(CASE WHEN v.age BETWEEN 26 AND 50 THEN 1 ELSE 0 END) as adult, " +
            " SUM(CASE WHEN v.age > 50 THEN 1 ELSE 0 END) as senior, " +
            " SUM(CASE WHEN v.gender = 'Female' THEN 1 ELSE 0 END) as female, " +
            " SUM(CASE WHEN v.gender = 'Male' THEN 1 ELSE 0 END) as male, " +
            " SUM(CASE WHEN v.occupation = 'FARMER' THEN 1 ELSE 0 END) as farmers, " +
            " SUM(CASE WHEN v.occupation = 'ORGANIZED_WORKER' THEN 1 ELSE 0 END) as businessmen ";

        String totalVotersSql = "SELECT COUNT(id) FROM voter_profiles WHERE assembly_constituency_ac ILIKE '%Delhi Cantt%'";
        long totalVoters = jdbcTemplate.getJdbcTemplate().queryForObject(totalVotersSql, Long.class);
        String sql = "SELECT COUNT(v.id) as filteredCount, " + sumBreakdown + " FROM voter_profiles v" + whereClause.toString();
        return jdbcTemplate.queryForObject(sql, params, (rs, rowNum) -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("totalVoters", totalVoters);
            resp.put("filteredCount", rs.getLong("filteredCount"));
            Map<String, Long> breakdown = new HashMap<>();
            breakdown.put("youth", rs.getLong("youth"));
            breakdown.put("adult", rs.getLong("adult"));
            breakdown.put("senior", rs.getLong("senior"));
            breakdown.put("male", rs.getLong("male"));
            breakdown.put("female", rs.getLong("female"));
            breakdown.put("farmers", rs.getLong("farmers"));
            breakdown.put("businessmen", rs.getLong("businessmen"));
            resp.put("breakdown", breakdown);
            return resp;
        });
    }

    // Keep old getDashboardSegmentation for the old endpoint path
    public Map<String, Object> getDashboardSegmentation(String view, Integer partNumber, String acName) {
        return getHierarchicalSegmentation(null, acName, partNumber);
    }
}
