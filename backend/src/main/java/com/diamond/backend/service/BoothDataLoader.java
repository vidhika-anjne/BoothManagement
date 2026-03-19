package com.diamond.backend.service;

import com.diamond.backend.model.BoothPart;
import com.diamond.backend.model.BoothSection;
import com.diamond.backend.repository.BoothPartRepository;
import com.diamond.backend.repository.BoothSectionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds booth_parts (from booths.json) and booth_sections (from delhi_cantt.json)
 * on first startup when tables are empty.
 *
 * KEY INSIGHT: booths.json and delhi_cantt.json use DIFFERENT partId values for the
 * same Delhi Cantt parts (AC 38). The common key is partNumber (1..40 within AC 38).
 * We match delhi_cantt.json parts to persisted BoothPart rows using (acNumber=38, partNumber).
 */
@Service
@Order(2)
public class BoothDataLoader implements CommandLineRunner {

    @Autowired private BoothPartRepository boothPartRepository;
    @Autowired private BoothSectionRepository boothSectionRepository;
    @Autowired private ResourceLoader resourceLoader;
    @Autowired private ObjectMapper objectMapper;

    private static final int DELHI_CANTT_AC = 38;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (boothPartRepository.count() > 0) {
            System.out.println("[BoothDataLoader] booth_parts already populated — skipping.");
            return;
        }

        // STEP 1: Persist all parts from booths.json and flush to get DB ids
        List<BoothPart> allParts = loadAllBooths();
        boothPartRepository.saveAll(allParts);
        boothPartRepository.flush();
        System.out.println("[BoothDataLoader] Saved " + allParts.size() + " booth parts from booths.json.");

        // STEP 2: Build partNumber → persisted BoothPart lookup for AC 38
        //         (booths.json and delhi_cantt.json share the same partNumbers 1..40 for AC 38,
        //          but use different partId values — so we join on partNumber)
        Map<Integer, BoothPart> ac38ByPartNumber = new HashMap<>();
        for (BoothPart p : boothPartRepository.findByAcNumber(DELHI_CANTT_AC)) {
            ac38ByPartNumber.put(p.getPartNumber(), p);
        }

        // STEP 3: Enrich Delhi Cantt parts with polling station info + build sections
        List<BoothSection> sections = loadDelhiCanttSections(ac38ByPartNumber);

        // Persist enriched parts (polling station name/address now set)
        boothPartRepository.saveAll(new ArrayList<>(ac38ByPartNumber.values()));
        boothPartRepository.flush();

        // Persist sections — BoothPart FKs are valid persisted entities now
        if (!sections.isEmpty()) {
            boothSectionRepository.saveAll(sections);
            System.out.println("[BoothDataLoader] Saved " + sections.size() + " booth sections from delhi_cantt.json.");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private List<BoothPart> loadAllBooths() throws Exception {
        Resource resource = resourceLoader.getResource("classpath:json/booths.json");
        List<BoothPart> parts = new ArrayList<>();

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            for (JsonNode district : root.path("districts")) {
                String districtId   = district.path("districtId").asText();
                String districtName = district.path("districtName").asText();
                for (JsonNode ac : district.path("assemblyConstituencies")) {
                    int    acNumber = ac.path("acNumber").asInt();
                    String acName   = ac.path("acName").asText();
                    for (JsonNode partNode : ac.path("parts")) {
                        BoothPart part = new BoothPart();
                        part.setPartId(partNode.path("partId").asLong());
                        part.setPartNumber(partNode.path("partNumber").asInt());
                        part.setPartName(partNode.path("partName").asText());
                        part.setAcNumber(acNumber);
                        part.setAcName(acName);
                        part.setDistrictId(districtId);
                        part.setDistrictName(districtName);
                        parts.add(part);
                    }
                }
            }
        }
        return parts;
    }

    /**
     * Reads delhi_cantt.json, enriches matching AC 38 BoothPart objects with polling station info,
     * and builds BoothSection rows referencing those persisted (non-transient) entities.
     *
     * @param ac38ByPartNumber  Map from partNumber (1..40) → persisted BoothPart for AC 38
     */
    private List<BoothSection> loadDelhiCanttSections(Map<Integer, BoothPart> ac38ByPartNumber) throws Exception {
        Resource resource = resourceLoader.getResource("classpath:json/delhi_cantt.json");
        List<BoothSection> sections = new ArrayList<>();
        int matched = 0, skipped = 0;

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            for (JsonNode partNode : root.path("parts")) {
                int    partNumber = partNode.path("partNumber").asInt();   // ← join key
                String psName     = partNode.path("pollingStationName").asText();
                String psAddress  = partNode.path("pollingStationAddress").asText();

                BoothPart boothPart = ac38ByPartNumber.get(partNumber);
                if (boothPart == null) {
                    System.out.println("[BoothDataLoader] WARNING: partNumber " + partNumber +
                            " not found in AC 38 — skipping its sections.");
                    skipped++;
                    continue;
                }

                boothPart.setPollingStationName(psName);
                boothPart.setPollingStationAddress(psAddress);
                matched++;

                for (JsonNode sectionNode : partNode.path("sections")) {
                    sections.add(new BoothSection(
                            sectionNode.path("sectionId").asInt(),
                            sectionNode.path("sectionName").asText(),
                            boothPart  // persisted entity — has a valid DB id
                    ));
                }
            }
        }
        System.out.println("[BoothDataLoader] Delhi Cantt: matched=" + matched + " parts, skipped=" + skipped + " parts.");
        return sections;
    }
}
