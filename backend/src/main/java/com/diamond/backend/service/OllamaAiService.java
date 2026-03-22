package com.diamond.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OllamaAiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${ollama.url:http://localhost:11434/api/generate}")
    private String ollamaUrl;

    public JsonNode analyzeComplaint(String desc, String duration, String impact, String details) {
        String prompt = String.format(
            "You are a civic complaint analysis system. ONLY return JSON.\n" +
            "Analyze the complaint:\n" +
            "Description: %s\n" +
            "Duration: %s\n" +
            "Impact: %s\n" +
            "Details: %s\n\n" +
            "Tasks:\n" +
            "1. Identify category (Water, Electricity, Road, Sanitation, Healthcare, Other).\n" +
            "2. Generate summary (1 sentence max).\n" +
            "3. Assign priority score (0-10) where larger impact/duration = higher.\n" +
            "4. Assign priority enum (High, Medium, Low).\n" +
            "5. Give reasoning (1 sentence max).\n\n" +
            "Return exactly in this JSON format: {\"category\":\"...\", \"summary\":\"...\", \"score\":..., \"priority\":\"...\", \"reason\":\"...\"}",
            desc, duration, impact, details
        );

        Map<String, Object> request = Map.of(
            "model", "deepseek-r1:1.5b",
            "prompt", prompt,
            "stream", false,
            "format", "json"
        );

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaUrl, request, Map.class);
            if(response.getBody() == null) return null;
            String responseText = (String) response.getBody().get("response");
            return mapper.readTree(responseText);
        } catch (Exception e) {
            e.printStackTrace();
            return null; // Fallback smoothly to rule engine
        }
    }
}
