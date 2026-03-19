package com.diamond.backend.service;

import com.diamond.backend.model.Scheme;
import com.diamond.backend.repository.SchemeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchemeDataLoader implements CommandLineRunner {

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        if (schemeRepository.count() == 0) {
            Resource resource = resourceLoader.getResource("classpath:json/scheme.json");
            try (InputStream inputStream = resource.getInputStream()) {
                JsonNode root = objectMapper.readTree(inputStream);
                JsonNode schemesNode = root.get("schemes");
                
                List<Scheme> schemes = new ArrayList<>();
                if (schemesNode.isArray()) {
                    for (JsonNode node : schemesNode) {
                        Scheme scheme = new Scheme();
                        scheme.setSchemeName(node.path("scheme_name").asText());
                        scheme.setAbbreviation(node.path("abbreviation").asText());
                        scheme.setType(node.path("type").asText());
                        scheme.setMinistry(node.path("ministry").asText());
                        
                        List<String> beneficiaries = new ArrayList<>();
                        node.path("beneficiaries").forEach(b -> beneficiaries.add(b.asText()));
                        scheme.setBeneficiaries(beneficiaries);
                        
                        scheme.setBeneficiariesText(node.path("beneficiaries_text").asText());
                        
                        if (node.has("age_min") && !node.get("age_min").isNull()) {
                            scheme.setAgeMin(node.get("age_min").asInt());
                        }
                        if (node.has("age_max") && !node.get("age_max").isNull()) {
                            scheme.setAgeMax(node.get("age_max").asInt());
                        }

                        List<String> genders = new ArrayList<>();
                        node.path("gender").forEach(g -> genders.add(g.asText()));
                        scheme.setGender(genders);

                        scheme.setObjectiveText(node.path("objective_text").asText());
                        scheme.setTenureText(node.path("tenure_text").asText());

                        // Handle financial benefits if present
                        JsonNode financialNode = node.path("financial_benefit");
                        if (!financialNode.isMissingNode()) {
                            scheme.setAmountPerYear(financialNode.path("amount_per_year").asInt());
                            scheme.setInstallments(financialNode.path("installments").asInt());
                            scheme.setAmountPerInstallment(financialNode.path("amount_per_installment").asInt());
                        }

                        schemes.add(scheme);
                    }
                }
                schemeRepository.saveAll(schemes);
                System.out.println("Loaded " + schemes.size() + " schemes from JSON into Database.");
            }
        }
    }
}
