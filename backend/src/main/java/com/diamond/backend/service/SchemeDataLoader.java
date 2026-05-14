package com.diamond.backend.service;

import com.diamond.backend.model.Scheme;
import com.diamond.backend.repository.SchemeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchemeDataLoader implements CommandLineRunner {

    private final SchemeRepository schemeRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    public SchemeDataLoader(SchemeRepository schemeRepository,
                            ResourceLoader resourceLoader,
                            ObjectMapper objectMapper) {
        this.schemeRepository = schemeRepository;
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("[SchemeDataLoader] Loading schemes from JSON...");

        // Correct filename per user requirement
        Resource resource = resourceLoader.getResource("classpath:json/schemejson.json");

        if (!resource.exists()) {
            System.err.println("[SchemeDataLoader] ERROR: JSON file not found at classpath:json/schemejson.json");
            return;
        }

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode schemesArray = root.path("schemes");

            if (!schemesArray.isArray()) {
                System.err.println("[SchemeDataLoader] ERROR: 'schemes' array not found in JSON.");
                return;
            }

            // Clear old data
            schemeRepository.deleteAll();

            List<Scheme> schemesToSave = new ArrayList<>();
            for (JsonNode node : schemesArray) {
                Scheme scheme = new Scheme();
                scheme.setSchemeName(node.path("scheme_name").asText());
                scheme.setAbbreviation(node.path("abbreviation").asText(null));
                scheme.setType(node.path("type").asText()); // Entity uses 'type' for 'type'
                scheme.setMinistry(node.path("ministry").asText());
                scheme.setObjectiveText(node.path("objective_text").asText());
                scheme.setBeneficiariesText(node.path("beneficiaries_text").asText());
                scheme.setTenureText(node.path("tenure_text").asText(null));
                
                // Handle optional numeric fields
                if (node.has("age_min") && !node.get("age_min").isNull()) scheme.setAgeMin(node.get("age_min").asInt());
                if (node.has("age_max") && !node.get("age_max").isNull()) scheme.setAgeMax(node.get("age_max").asInt());
                
                // Financial Benefit
                JsonNode fin = node.path("financial_benefit");
                if (!fin.isMissingNode()) {
                    scheme.setAmountPerYear(fin.path("amount_per_year").asInt());
                    scheme.setInstallments(fin.path("installments").asInt());
                    scheme.setAmountPerInstallment(fin.path("amount_per_installment").asInt());
                }

                // Collections
                List<String> beneficiariesList = new ArrayList<>();
                node.path("beneficiaries").forEach(b -> beneficiariesList.add(b.asText()));
                scheme.setBeneficiaries(beneficiariesList);

                List<String> genderList = new ArrayList<>();
                node.path("gender").forEach(g -> genderList.add(g.asText()));
                scheme.setGender(genderList);

                schemesToSave.add(scheme);
            }
            schemeRepository.saveAll(schemesToSave);
        }

        System.out.println("[SchemeDataLoader] Schemes loaded successfully! Total: " + schemeRepository.count());
    }
}