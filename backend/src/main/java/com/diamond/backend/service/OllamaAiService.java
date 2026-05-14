package com.diamond.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service to interact with Ollama for AI-based scheme recommendations.
 */
@Service
public class OllamaAiService {

    @Value("${ollama.url:http://localhost:11434/api/generate}")
    private String ollamaUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public JsonNode getAiRecommendation(String prompt) {
        Map<String, Object> request = new HashMap<>();
        request.put("model", "llama2");
        request.put("prompt", prompt);
        request.put("stream", false);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                ollamaUrl, request, (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null) return null;
            String responseText = (String) body.get("response");
            return mapper.readTree(responseText);
        } catch (Exception e) {
            e.printStackTrace();
            return null; // Fallback smoothly to rule engine
        }
    }
}
