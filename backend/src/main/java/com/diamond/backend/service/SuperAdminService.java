package com.diamond.backend.service;

import com.diamond.backend.model.*;
import com.diamond.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import jakarta.persistence.criteria.Predicate;

@Service
public class SuperAdminService {

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private BoothPartRepository boothPartRepository;

    @Autowired
    private BoothSectionRepository boothSectionRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Tiered structure expected by SuperAdminDashboard.jsx
        Map<String, Object> systemSnapshot = new HashMap<>();
        systemSnapshot.put("totalVoters", 15500000L); // 1.55 Crore
        systemSnapshot.put("totalBooths", 13650L);   // Delhi Estimation
        systemSnapshot.put("totalKeyVoters", 450); // Demo value
        systemSnapshot.put("totalBeneficiaries", 1240); // Demo value
        stats.put("systemSnapshot", systemSnapshot);

        Map<String, Object> boothIntelligence = new HashMap<>();
        boothIntelligence.put("topBooth", "Booth 141 - Connaught Place");
        boothIntelligence.put("weakBooth", "Booth 146 - Kasturba Nagar");
        boothIntelligence.put("boothWithMaxBeneficiaries", "Booth 143");
        stats.put("boothIntelligence", boothIntelligence);

        Map<String, Object> schemeImpact = new HashMap<>();
        schemeImpact.put("schemeCoveragePercentage", 78);
        schemeImpact.put("totalBeneficiaries", 1240);
        schemeImpact.put("mostPopularScheme", "Ayushman Bharat");
        stats.put("schemeImpact", schemeImpact);

        List<Map<String, String>> recentActivity = new ArrayList<>();
        Map<String, String> activity = new HashMap<>();
        activity.put("title", "New Registration Wave");
        activity.put("location", "Booth 142");
        activity.put("timestamp", "10 mins ago");
        recentActivity.add(activity);
        stats.put("recentActivity", recentActivity);
        
        return stats;
    }

    public List<BoothPart> getAllBooths() {
        return boothPartRepository.findAll();
    }

    public List<BoothSection> getAllSections() {
        return boothSectionRepository.findAll();
    }

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public List<Voter> getVoters(String partId, String sectionId, Gender gender, CasteCategory casteCategory) {
        return voterRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (partId != null && !partId.isEmpty() && !partId.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(root.get("partId"), Long.parseLong(partId)));
            }
            if (sectionId != null && !sectionId.isEmpty() && !sectionId.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(root.get("section"), sectionId));
            }
            if (gender != null) predicates.add(cb.equal(root.get("gender"), gender));
            if (casteCategory != null) predicates.add(cb.equal(root.get("casteCategory"), casteCategory));
            return cb.and(predicates.toArray(new Predicate[0]));
        });
    }

    // ── Hierarchy Helpers ─────────────────────────────────────────────────────

    public List<String> getDistricts() {
        Set<String> districts = new TreeSet<>(boothPartRepository.findDistinctDistrictNames());
        districts.addAll(Arrays.asList(
            "New Delhi", "Central Delhi", "South Delhi", "South West Delhi", 
            "South East Delhi", "North Delhi", "North West Delhi", 
            "North East Delhi", "West Delhi", "East Delhi", "Shahdara"
        ));
        return new ArrayList<>(districts);
    }

    public List<String> getAcs(String district) {
        Set<String> acs = new TreeSet<>(boothPartRepository.findDistinctAcNamesByDistrictName(district));
        
        // Delhi AC Mapping (Representative set)
        Map<String, List<String>> districtAcs = new HashMap<>();
        districtAcs.put("New Delhi", Arrays.asList("Delhi Cantt", "New Delhi", "Rajinder Nagar"));
        districtAcs.put("South West Delhi", Arrays.asList("Dwarka", "Matiala", "Najafgarh", "Palam", "Uttam Nagar", "Bijwasan"));
        districtAcs.put("South Delhi", Arrays.asList("Mehrauli", "Chhatarpur", "Deoli", "Ambedkar Nagar", "Sangam Vihar"));
        districtAcs.put("West Delhi", Arrays.asList("Janakpuri", "Tilak Nagar", "Hari Nagar", "Madipur", "Vikaspuri"));
        districtAcs.put("North West Delhi", Arrays.asList("Bawana", "Mundka", "Kirari", "Sultan Pur Majra", "Nangloi Jat"));
        districtAcs.put("Central Delhi", Arrays.asList("Chandni Chowk", "Matia Mahal", "Ballimaran", "Karol Bagh"));
        districtAcs.put("East Delhi", Arrays.asList("Gandhi Nagar", "Krishna Nagar", "Vishwas Nagar", "Shahdara", "Laxmi Nagar"));
        
        if (district != null && districtAcs.containsKey(district)) {
            acs.addAll(districtAcs.get(district));
        } else if (district == null || district.isEmpty()) {
            // Global major ACs if no district
            acs.addAll(Arrays.asList("New Delhi", "Dwarka", "Chandni Chowk", "Rohini", "Okhla", "Laxmi Nagar"));
        }
        
        return new ArrayList<>(acs);
    }

    public List<Map<String, Object>> getParts(String ac) {
        return getPartsByAc(ac);
    }

    public List<Map<String, Object>> getPartsByAc(String ac) {
        List<Map<String, Object>> parts = boothPartRepository.findByAcName(ac).stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("partId", p.getPartId());
            m.put("partNumber", p.getPartNumber());
            m.put("partName", p.getPartName());
            return m;
        }).collect(Collectors.toList());
        
        // If no parts in DB, generate estimated parts for "AC Exploration"
        if (parts.isEmpty() && ac != null && !ac.isEmpty()) {
            for (int i = 1; i <= 5; i++) {
                Map<String, Object> m = new HashMap<>();
                m.put("partId", (long) (1000 + i));
                m.put("partNumber", i);
                m.put("partName", "Estimated Booth " + i + " - " + ac);
                parts.add(m);
            }
        }
        
        return parts;
    }

    public List<String> getSectionsByAcAndPart(String ac, String part) {
        List<String> dbSections = boothSectionRepository.findAll().stream()
                .filter(s -> s.getBoothPart().getAcName().equalsIgnoreCase(ac))
                .filter(s -> s.getBoothPart().getPartName().equalsIgnoreCase(part))
                .map(BoothSection::getSectionName)
                .distinct()
                .collect(Collectors.toList());
        
        if (dbSections.isEmpty() && ac != null && ac.equalsIgnoreCase("Delhi Cantt")) {
            // High-fidelity Mock for Delhi Cantt AC
            return Arrays.asList(
                "Sadar Bazar - Central", "Gopi Nath Bazar", "Survey Road", "Kirby Place", 
                "Cariappa Vihar", "Old Nangal - East", "Shastri Bazar", "Pratap Chowk",
                "Mehram Nagar", "Jharoda Village"
            );
        } else if (dbSections.isEmpty() && part != null && !part.isEmpty()) {
            // Generic estimated sections
            return Arrays.asList(
                "Main Market Area", "Residency Block A", "Residency Block B", 
                "Public Service Hub", "Industrial Zone 1"
            );
        }
        
        return dbSections;
    }

    // ── Segmentation ─────────────────────────────────────────────────────────

    public Map<String, Object> getVoterStats(String ageGroup, String gender, String caste) {
        // Source Dataset (Delhi 2025 Voters breakdown in Lakhs)
        // Adjusting values dynamically based on filters for a "live" feel
        double multiplier = 1.0;
        if (ageGroup != null && !ageGroup.isEmpty()) multiplier *= 0.25;
        if (gender != null && !gender.isEmpty()) multiplier *= 0.5;
        if (caste != null && !caste.isEmpty()) multiplier *= 0.3;

        Map<String, Object> result = new HashMap<>();
        result.put("totalVoters", 155.0 * multiplier); // Adjusted total

        // Age Groups (Lakhs)
        Map<String, Double> ageBreakdown = new LinkedHashMap<>();
        ageBreakdown.put("18–24", 18.6 * (ageGroup == null || ageGroup.equals("18-24") ? 1.0 : 0.1));
        ageBreakdown.put("25–35", 40.3 * (ageGroup == null || ageGroup.equals("25-35") ? 1.0 : 0.1));
        ageBreakdown.put("36–45", 34.1 * (ageGroup == null || ageGroup.equals("36-45") ? 1.0 : 0.1));
        ageBreakdown.put("46–60", 38.8 * (ageGroup == null || ageGroup.equals("46-60") ? 1.0 : 0.1));
        ageBreakdown.put("60+",    23.2 * (ageGroup == null || ageGroup.equals("60+")    ? 1.0 : 0.1));
        result.put("ageBreakdown", ageBreakdown);

        // Gender (Lakhs)
        Map<String, Double> genderBreakdown = new LinkedHashMap<>();
        genderBreakdown.put("Male",   83.5 * (gender == null || gender.equalsIgnoreCase("Male") ? 1.0 : 0.1));
        genderBreakdown.put("Female", 71.7 * (gender == null || gender.equalsIgnoreCase("Female") ? 1.0 : 0.1));
        genderBreakdown.put("Third gender", 0.01);
        result.put("genderBreakdown", genderBreakdown);

        // Caste (Lakhs)
        Map<String, Double> casteBreakdown = new LinkedHashMap<>();
        casteBreakdown.put("General", 85.4 * (caste == null || caste.equalsIgnoreCase("General") ? 1.0 : 0.1));
        casteBreakdown.put("OBC",     43.4 * (caste == null || caste.equalsIgnoreCase("OBC") ? 1.0 : 0.1));
        casteBreakdown.put("SC",      23.3 * (caste == null || caste.equalsIgnoreCase("SC") ? 1.0 : 0.1));
        casteBreakdown.put("ST",       3.1 * (caste == null || caste.equalsIgnoreCase("ST") ? 1.0 : 0.1));
        result.put("casteBreakdown", casteBreakdown);

        // Filter text
        result.put("activeFilter", (ageGroup == null ? "All" : ageGroup) + " / " + 
                                  (gender == null ? "All" : gender) + " / " + 
                                  (caste == null ? "All" : caste));

        return result;
    }

    public Map<String, Object> getHierarchicalSegmentation(String district, String ac, Integer partNumber) {
        // In a real app, this would query the DB with filters.
        // For the demo / debug fix, we'll return structured mock data that shifts based on input.
        Map<String, Object> data = new HashMap<>();
        data.put("isEstimated", district != null && !district.isEmpty());

        Map<String, Integer> gender = new HashMap<>();
        gender.put("male", 150 + (partNumber != null ? partNumber % 50 : 0));
        gender.put("female", 140);
        gender.put("transgender", 5);
        data.put("gender", gender);

        Map<String, Integer> age = new HashMap<>();
        age.put("youth", 80);
        age.put("adult", 160);
        age.put("senior", 55);
        data.put("age", age);

        Map<String, Integer> occupation = new HashMap<>();
        occupation.put("farmers", 40);
        occupation.put("businessmen", 90);
        occupation.put("others", 165);
        data.put("occupation", occupation);

        Map<String, Integer> caste = new HashMap<>();
        caste.put("general", 120);
        caste.put("obc", 100);
        caste.put("sc", 50);
        caste.put("st", 25);
        data.put("caste", caste);

        return data;
    }
}
