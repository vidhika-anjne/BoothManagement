package com.diamond.backend.service;

import com.diamond.backend.model.Voter;
import com.diamond.backend.repository.VoterRepository;
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
import java.util.List;

/**
 * Seeds (or re-seeds) the voter_profiles table from voters_demo.json on every startup.
 * The table is truncated first so changes to the JSON are always reflected.
 * Runs at Order(3), after SchemeDataLoader(1) and BoothDataLoader(2).
 */
@Service
@Order(3)
public class VoterDataLoader implements CommandLineRunner {

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if data already exists to prevent running on every restart
        if (voterRepository.count() > 0) {
            System.out.println("[VoterDataLoader] Voters already loaded. Skipping.");
            return;
        }

        // Always truncate and reload so the JSON is the single source of truth
        voterRepository.deleteAll();
        System.out.println("[VoterDataLoader] Cleared voter_profiles table.");

        Resource resource = resourceLoader.getResource("classpath:json/voters_demo.json");
        List<Voter> voters = new ArrayList<>();

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);

            for (JsonNode node : root) {
                Voter voter = new Voter();

                voter.setVoterId(node.path("voterId").asText());
                voter.setName(node.path("name").asText());
                voter.setAge(node.path("age").asInt());
                voter.setDistrict(node.path("district").asText());
                voter.setAssemblyConstituencyAc(node.path("assemblyConstituencyAc").asText());
                voter.setPartId(node.path("partId").asLong());
                voter.setHouseNumber(node.path("houseNumber").asText());
                voter.setPartNumber(node.path("partNumber").asInt());
                voter.setPartName(node.path("partName").asText());
                voter.setSection(node.path("section").asText());
                voter.setDisability(node.path("disability").asBoolean());
                voter.setMinority(node.path("minority").asBoolean());
                voter.setStudent(node.path("student").asBoolean());
                voter.setBpl(node.path("bpl").asBoolean());
                voter.setAnnualIncome(node.path("annualIncome").asInt());
                voter.setGovernmentEmployee(node.path("governmentEmployee").asBoolean());

                // Mobile number (used for citizen portal login)
                String mobile = node.path("mobile_number").asText("").trim();
                if (!mobile.isEmpty()) {
                    voter.setMobileNumber(mobile);
                }

                // Enum fields — parse with fallback
                try {
                    voter.setGender(Voter.Gender.valueOf(node.path("gender").asText()));
                } catch (IllegalArgumentException e) {
                    voter.setGender(Voter.Gender.Other);
                }

                try {
                    voter.setMaritalStatus(Voter.MaritalStatus.valueOf(node.path("maritalStatus").asText()));
                } catch (IllegalArgumentException e) {
                    voter.setMaritalStatus(Voter.MaritalStatus.Single);
                }

                try {
                    voter.setArea(Voter.AreaType.valueOf(node.path("area").asText()));
                } catch (IllegalArgumentException e) {
                    voter.setArea(Voter.AreaType.Urban);
                }

                try {
                    voter.setCasteCategory(Voter.CasteCategory.valueOf(node.path("casteCategory").asText()));
                } catch (IllegalArgumentException e) {
                    voter.setCasteCategory(Voter.CasteCategory.General);
                }

                try {
                    voter.setEmploymentStatus(Voter.EmploymentStatus.valueOf(node.path("employmentStatus").asText()));
                } catch (IllegalArgumentException e) {
                    voter.setEmploymentStatus(Voter.EmploymentStatus.Unemployed);
                }

                String occStr = node.path("occupation").asText("").trim();
                if (!occStr.isEmpty()) {
                    try {
                        voter.setOccupation(Voter.Occupation.valueOf(occStr));
                    } catch (IllegalArgumentException e) {
                        voter.setOccupation(null);
                    }
                }

                voters.add(voter);
            }
        }

        voterRepository.saveAll(voters);
        System.out.println("[VoterDataLoader] Loaded " + voters.size() + " voters from voters_demo.json.");
    }
}
