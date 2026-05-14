package com.diamond.backend.service;

import com.diamond.backend.model.*;
import com.diamond.backend.repository.VoterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VoterService {

    private final VoterRepository voterRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public VoterService(VoterRepository voterRepository, SimpMessagingTemplate messagingTemplate) {
        this.voterRepository = voterRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Page<Voter> getVoters(Map<String, Object> filters, Pageable pageable) {
        return voterRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters.get("gender") != null && !filters.get("gender").toString().isEmpty() && !filters.get("gender").equals("All")) {
                predicates.add(cb.equal(root.get("gender"), Gender.valueOf(filters.get("gender").toString())));
            }
            if (filters.get("casteCategory") != null && !filters.get("casteCategory").toString().isEmpty() && !filters.get("casteCategory").equals("All")) {
                predicates.add(cb.equal(root.get("casteCategory"), CasteCategory.valueOf(filters.get("casteCategory").toString())));
            }
            if (filters.get("area") != null && !filters.get("area").toString().isEmpty() && !filters.get("area").equals("All")) {
                predicates.add(cb.equal(root.get("area"), AreaType.valueOf(filters.get("area").toString())));
            }
            if (filters.get("partId") != null && !filters.get("partId").equals("All")) {
                predicates.add(cb.equal(root.get("partId"), Long.parseLong(filters.get("partId").toString())));
            }
            if (filters.get("voterId") != null && !filters.get("voterId").toString().isEmpty()) {
                predicates.add(cb.like(root.get("voterId"), "%" + filters.get("voterId") + "%"));
            }
            if (filters.get("name") != null && !filters.get("name").toString().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + filters.get("name").toString().toLowerCase() + "%"));
            }
            if (filters.get("search") != null && !filters.get("search").toString().isEmpty()) {
                String s = "%" + filters.get("search").toString().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), s),
                    cb.like(cb.lower(root.get("voterId")), s)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    public Page<Voter> getVoters(String search, String status, String partId, String domain, Pageable pageable) {
        Map<String, Object> filters = new HashMap<>();
        filters.put("search", search);
        filters.put("status", status);
        filters.put("partId", partId);
        filters.put("domain", domain);
        return getVoters(filters, pageable);
    }

    public Voter createVoter(Voter voter) {
        System.out.println("[VoterService] Before defaults - VoterId: " + voter.getVoterId() + ", District: " + voter.getDistrict() + ", AC: " + voter.getAssemblyConstituency() + ", Gender: " + voter.getGender());

        if (voter.getVoterId() == null || voter.getVoterId().trim().isEmpty()) {
            voter.setVoterId("VTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // Ensure required fields for DB constraints (demo defaults)
        if (voter.getDistrict() == null || voter.getDistrict().isEmpty())
            voter.setDistrict("Digital District");
        if (voter.getAssemblyConstituency() == null || voter.getAssemblyConstituency().isEmpty())
            voter.setAssemblyConstituency("AC-01");
        if (voter.getArea() == null)
            voter.setArea(AreaType.Urban);
        if (voter.getCasteCategory() == null)
            voter.setCasteCategory(CasteCategory.General);
        if (voter.getGender() == null)
            voter.setGender(Gender.Male);
        if (voter.getStatus() == null)
            voter.setStatus(VoterStatus.PENDING);

        // Map domain to occupation/other flags for recommendations
        if (voter.getDomain() != null && voter.getOccupation() == null) {
            String domain = voter.getDomain().toLowerCase();
            if (domain.contains("agri")) {
                voter.setOccupation(Occupation.FARMER);
            } else if (domain.contains("women")) {
                voter.setGender(Gender.Female);
                voter.setOccupation(Occupation.OTHERS);
            } else if (domain.contains("employ")) {
                voter.setOccupation(Occupation.UNORGANIZED_WORKER);
            } else if (domain.contains("health")) {
                voter.setOccupation(Occupation.HEALTH_WORKER);
            } else if (domain.contains("senior")) {
                if (voter.getAge() == null || voter.getAge() < 60) voter.setAge(65);
                voter.setOccupation(Occupation.OTHERS);
            } else if (domain.contains("education") || domain.contains("youth")) {
                voter.setStudent(true);
            }
        }

        System.out.println("[VoterService] After defaults - VoterId: " + voter.getVoterId() + ", District: " + voter.getDistrict() + ", AC: " + voter.getAssemblyConstituency() + ", Occupation: " + voter.getOccupation());

        try {
            Voter saved = voterRepository.save(voter);
            broadcastUpdate();
            return saved;
        } catch (Exception e) {
            System.err.println("[VoterService] Error saving voter: " + e.getMessage());
            throw e;
        }
    }

    public Voter addVoter(Voter voter) {
        return createVoter(voter);
    }

    @Transactional
    public void deleteByVoterId(String voterId) {
        voterRepository.deleteByVoterId(voterId);
        broadcastUpdate();
    }

    @Transactional
    public void deleteById(Long id) {
        voterRepository.deleteById(id);
        broadcastUpdate();
    }

    public Map<String, Object> getVoterStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Voter> allVoters = voterRepository.findAll();
        long total = allVoters.size();
        stats.put("totalVoters", total);

        // Domain Insights
        Map<String, List<Voter>> byDomain = allVoters.stream()
            .filter(v -> v.getDomain() != null)
            .collect(java.util.stream.Collectors.groupingBy(Voter::getDomain));

        List<Map<String, Object>> domainInsights = new ArrayList<>();
        byDomain.forEach((name, voters) -> {
            Map<String, Object> insight = new HashMap<>();
            insight.put("name", name);
            insight.put("count", voters.size());
            
            // Status breakdown for the mini bar
            Map<String, Long> statusBreakdown = voters.stream()
                .filter(v -> v.getStatus() != null)
                .collect(java.util.stream.Collectors.groupingBy(v -> v.getStatus().name(), java.util.stream.Collectors.counting()));
            insight.put("statusBreakdown", statusBreakdown);
            
            // Example schemes (mocking for UI)
            List<String> mockSchemes = List.of("PM Awas", "Kisan Samman", "Lakhpati Didi");
            insight.put("schemes", mockSchemes.subList(0, (int)(Math.random() * 3) + 1));
            
            domainInsights.add(insight);
        });
        stats.put("domainInsights", domainInsights);

        // Status Counts
        Map<String, Long> statusCounts = allVoters.stream()
            .filter(v -> v.getStatus() != null)
            .collect(java.util.stream.Collectors.groupingBy(v -> v.getStatus().name(), java.util.stream.Collectors.counting()));
        stats.put("statusCounts", statusCounts);

        // Booths (Unique IDs)
        List<Long> booths = allVoters.stream()
            .map(Voter::getPartId)
            .filter(pid -> pid != null)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
        stats.put("booths", booths);

        return stats;
    }

    public Map<String, Object> getVoterAnalytics() {
        return getVoterStats();
    }

    public String exportToCsv(String search, String status, String partId, String domain) {
        Page<Voter> voters = getVoters(search, status, partId, domain, Pageable.unpaged());
        StringBuilder csv = new StringBuilder("VoterID,Name,Age,Gender,PartID,Status\n");
        for (Voter v : voters.getContent()) {
            csv.append(v.getVoterId()).append(",")
               .append(v.getName()).append(",")
               .append(v.getAge()).append(",")
               .append(v.getGender()).append(",")
               .append(v.getPartId()).append(",")
               .append(v.getStatus()).append("\n");
        }
        return csv.toString();
    }

    private void broadcastUpdate() {
        messagingTemplate.convertAndSend("/topic/voters", "updated");
    }
}
