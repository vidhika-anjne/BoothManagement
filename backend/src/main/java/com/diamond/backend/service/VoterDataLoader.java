package com.diamond.backend.service;

import com.diamond.backend.model.*;
import com.diamond.backend.repository.VoterRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@Order(3)
public class VoterDataLoader implements CommandLineRunner {

    private final VoterRepository voterRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    public VoterDataLoader(VoterRepository voterRepository,
                           ResourceLoader resourceLoader,
                           ObjectMapper objectMapper) {
        this.voterRepository = voterRepository;
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (voterRepository.count() > 0) {
            System.out.println("[VoterDataLoader] Data already exists. Skipping seed.");
            return;
        }

        System.out.println("[VoterDataLoader] Seeding data from json/voters_demo.json...");

        Resource resource = resourceLoader.getResource("classpath:json/voters_demo.json");
        List<Voter> votersToSave = new ArrayList<>();

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);

            for (JsonNode node : root) {
                Voter voter = new Voter();
                voter.setVoterId(node.path("voterId").asText());
                voter.setName(node.path("name").asText());
                voter.setAge(node.path("age").asInt());
                
                voter.setGender(safeEnum(Gender.class, node.path("gender").asText(), Gender.Male));
                voter.setMaritalStatus(safeEnum(MaritalStatus.class, node.path("maritalStatus").asText(), MaritalStatus.Single));
                voter.setArea(safeEnum(AreaType.class, node.path("area").asText(), AreaType.Urban));
                voter.setCasteCategory(safeEnum(CasteCategory.class, node.path("casteCategory").asText(), CasteCategory.General));
                voter.setOccupation(safeEnum(Occupation.class, node.path("occupation").asText(), Occupation.OTHERS));

                voter.setDistrict(node.path("district").asText("Digital District"));
                voter.setAssemblyConstituency(node.path("assemblyConstituencyAc").asText("AC-01"));
                voter.setPartId(node.path("partId").asLong());
                voter.setHouseNumber(node.path("houseNumber").asText());
                voter.setPartNumber(node.path("partNumber").asInt());
                voter.setPartName(node.path("partName").asText());
                voter.setSection(node.path("section").asText());
                voter.setDisability(node.path("disability").asBoolean(false));
                voter.setMinority(node.path("minority").asBoolean(false));
                voter.setStudent(node.path("student").asBoolean(false));
                voter.setBpl(node.path("bpl").asBoolean(false));
                voter.setAnnualIncome(node.path("annualIncome").asInt(0));
                voter.setGovernmentEmployee(node.path("governmentEmployee").asBoolean(false));
                voter.setMobileNumber(node.path("mobile_number").asText(null));
                
                String[] domains = {"Agriculture", "Education", "Health", "Employment", "Infrastructure"};
                voter.setDomain(domains[(int) (Math.random() * domains.length)]);
                
                voter.setStatus(VoterStatus.PENDING);
                votersToSave.add(voter);
            }
            voterRepository.saveAll(votersToSave);
        }
        System.out.println("[VoterDataLoader] Seeding completed. Loaded " + votersToSave.size() + " records.");
    }

    private <E extends Enum<E>> E safeEnum(Class<E> enumClass, String value, E defaultValue) {
        if (value == null || value.trim().isEmpty()) return defaultValue;
        try {
            return Enum.valueOf(enumClass, value);
        } catch (Exception e1) {
            try {
                return Enum.valueOf(enumClass, value.toUpperCase());
            } catch (Exception e2) {
                if (enumClass == Occupation.class) {
                    for (Occupation opt : Occupation.values()) {
                        if (opt.getLabel().equalsIgnoreCase(value)) {
                            return enumClass.cast(opt);
                        }
                    }
                }
            }
        }
        return defaultValue;
    }
}
