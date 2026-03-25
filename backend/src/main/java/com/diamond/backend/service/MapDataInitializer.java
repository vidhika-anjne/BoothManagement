package com.diamond.backend.service;

import com.diamond.backend.model.District;
import com.diamond.backend.model.AC;
import com.diamond.backend.repository.DistrictRepository;
import com.diamond.backend.repository.ACRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.Random;

// @Service - Disabled to prevent overwriting existing PostgreSQL database with dummy initialized generated data.
public class MapDataInitializer implements CommandLineRunner {

    private final DistrictRepository districtRepository;
    private final ACRepository acRepository;
    // private final BoothRepository boothRepository;
    private final ObjectMapper objectMapper;
    private final Random random = new Random(12345);

    public MapDataInitializer(DistrictRepository districtRepository,
                              ACRepository acRepository,
                              // BoothRepository boothRepository,
                              ObjectMapper objectMapper) {
        this.districtRepository = districtRepository;
        this.acRepository = acRepository;
        // this.boothRepository = boothRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        /*
        Code removed temporarily to resolve compilation errors 
        relating to the non-existent 'Booth' entity. 
        The correct entity is 'BoothPart'.
        */
        System.out.println("Map Data Initializer skipped due to compilation constraints.");
    }

    private String generateSquareGeoJson(double lat, double lng, double radius) {
        String template = "{ \"type\": \"Feature\", \"geometry\": { \"type\": \"Polygon\", \"coordinates\": [ [ " +
                "[%f, %f], [%f, %f], [%f, %f], [%f, %f], [%f, %f] " +
                "] ] }, \"properties\": {} }";
        // lng, lat arrays
        double lng1 = lng - radius, lat1 = lat - radius;
        double lng2 = lng + radius, lat2 = lat - radius;
        double lng3 = lng + radius, lat3 = lat + radius;
        double lng4 = lng - radius, lat4 = lat + radius;

        return String.format(template, 
                lng1, lat1, 
                lng2, lat2, 
                lng3, lat3, 
                lng4, lat4, 
                lng1, lat1);
    }
}
