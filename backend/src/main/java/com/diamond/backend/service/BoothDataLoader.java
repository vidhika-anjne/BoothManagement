package com.diamond.backend.service;

import com.diamond.backend.model.AC;
import com.diamond.backend.model.BoothPart;
import com.diamond.backend.model.BoothSection;
import com.diamond.backend.model.District;
import com.diamond.backend.repository.ACRepository;
import com.diamond.backend.repository.BoothPartRepository;
import com.diamond.backend.repository.BoothSectionRepository;
import com.diamond.backend.repository.DistrictRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;

@Service
@Order(2)
public class BoothDataLoader implements CommandLineRunner {


@Autowired private BoothPartRepository boothPartRepository;
@Autowired private BoothSectionRepository boothSectionRepository;
@Autowired private DistrictRepository districtRepository;
@Autowired private ACRepository acRepository;
@Autowired private ResourceLoader resourceLoader;
@Autowired private ObjectMapper objectMapper;
@Autowired private EntityManager entityManager;

private static final int DELHI_CANTT_AC = 38;

@Override
@Transactional
public void run(String... args) throws Exception {

    long existing = boothPartRepository.count();

    // ✅ Skip if already loaded
    if (existing > 0) {
        System.out.println("[BoothDataLoader] Data already exists (" + existing + ") — skipping.");
        return;
    }

    System.out.println("[BoothDataLoader] Fresh load starting...");

    // STEP 1: Load all parts
    List<BoothPart> allParts = loadAllBooths();

    // STEP 2: Remove duplicates
    Map<Long, BoothPart> uniqueMap = new HashMap<>();
    for (BoothPart part : allParts) {
        uniqueMap.put(part.getPartId(), part);
    }

    List<BoothPart> uniqueParts = new ArrayList<>(uniqueMap.values());

    // STEP 3: Save unique parts
    boothPartRepository.saveAll(uniqueParts);
    boothPartRepository.flush();

    System.out.println("[BoothDataLoader] Saved " + uniqueParts.size() + " booth parts.");

    // STEP 4: Build AC 38 map
    Map<Integer, BoothPart> ac38ByPartNumber = new HashMap<>();
    for (BoothPart p : boothPartRepository.findByAcAcNumber(DELHI_CANTT_AC)) {
        ac38ByPartNumber.put(p.getPartNumber(), p);
    }

    // STEP 5: Load sections
    List<BoothSection> sections = loadDelhiCanttSections(ac38ByPartNumber);

    // Save updated parts
    boothPartRepository.saveAll(new ArrayList<>(ac38ByPartNumber.values()));

    // Save sections
    if (!sections.isEmpty()) {
        boothSectionRepository.saveAll(sections);
        System.out.println("[BoothDataLoader] Saved " + sections.size() + " booth sections.");
    }
}

// ── Load all booths ─────────────────────────────────────────────
private List<BoothPart> loadAllBooths() throws Exception {

    Resource resource = resourceLoader.getResource("classpath:json/final_data (1).json");
    List<BoothPart> parts = new ArrayList<>();

    try (InputStream is = resource.getInputStream()) {

        JsonNode root = objectMapper.readTree(is);

        for (JsonNode districtNode : root.path("districts")) {

            String districtId = districtNode.path("districtId").asText();
            String districtName = districtNode.path("districtName").asText();

            District district = districtRepository.findById(districtId).orElseGet(() -> {
                return districtRepository.save(new District(districtId, districtName, null));
            });

            for (JsonNode acNode : districtNode.path("assemblyConstituencies")) {

                int acNumber = acNode.path("acNumber").asInt();
                String acName = acNode.path("acName").asText();

                AC ac = acRepository.findById(acNumber).orElseGet(() -> {
                    return acRepository.save(new AC(acNumber, acName, district, null));
                });

                for (JsonNode partNode : acNode.path("parts")) {

                    BoothPart part = new BoothPart();

                    part.setPartId(partNode.path("partId").asLong());
                    part.setPartNumber(partNode.path("partNumber").asInt());
                    part.setPartName(partNode.path("partName").asText());
                    part.setAc(ac);

                    parts.add(part);
                }
            }
        }
    }

    return parts;
}

// ── Load sections ─────────────────────────────────────────────
private List<BoothSection> loadDelhiCanttSections(Map<Integer, BoothPart> ac38ByPartNumber) throws Exception {

    Resource resource = resourceLoader.getResource("classpath:json/delhi_cantt.json");
    List<BoothSection> sections = new ArrayList<>();

    try (InputStream is = resource.getInputStream()) {

        JsonNode root = objectMapper.readTree(is);

        for (JsonNode partNode : root.path("parts")) {

            int partNumber = partNode.path("partNumber").asInt();

            BoothPart boothPart = ac38ByPartNumber.get(partNumber);

            if (boothPart == null) continue;

            boothPart.setPollingStationName(partNode.path("pollingStationName").asText());
            boothPart.setPollingStationAddress(partNode.path("pollingStationAddress").asText());

            for (JsonNode sectionNode : partNode.path("sections")) {

                sections.add(new BoothSection(
                        sectionNode.path("sectionId").asInt(),
                        sectionNode.path("sectionName").asText(),
                        boothPart
                ));
            }
        }
    }

    return sections;
}


}
