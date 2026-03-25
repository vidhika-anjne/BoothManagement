package com.diamond.backend.controller;

import com.diamond.backend.model.District;
import com.diamond.backend.model.AC;
import com.diamond.backend.model.Scheme;
import com.diamond.backend.repository.DistrictRepository;
import com.diamond.backend.repository.ACRepository;
import com.diamond.backend.repository.SchemeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MapController {

    private final DistrictRepository districtRepository;
    private final ACRepository acRepository;
    private final SchemeRepository schemeRepository;

    @Autowired
    public MapController(DistrictRepository districtRepository,
                         ACRepository acRepository,
                         SchemeRepository schemeRepository) {
        this.districtRepository = districtRepository;
        this.acRepository = acRepository;
        this.schemeRepository = schemeRepository;
    }

    // ✅ Get all districts (GeoJSON)
    @GetMapping(value = "/districts", produces = "application/json")
    public ResponseEntity<String> getAllDistricts() {
        List<District> districts = districtRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"FeatureCollection\",\"features\":[");

        for (int i = 0; i < districts.size(); i++) {
            District d = districts.get(i);

            sb.append("{\"type\":\"Feature\",\"properties\":{\"districtId\":\"")
              .append(d.getDistrictId())
              .append("\",\"name\":\"")
              .append(d.getName())
              .append("\"},\"geometry\":")
              .append(d.getGeoJson() != null ? d.getGeoJson() : "null")
              .append("}");

            if (i < districts.size() - 1) sb.append(",");
        }

        sb.append("]}");

        return ResponseEntity.ok(sb.toString());
    }

    // ✅ Get ACs by district
    @GetMapping(value = "/acs", produces = "application/json")
    public ResponseEntity<String> getAcsByDistrict(@RequestParam(name = "districtId") String districtId) {
        List<AC> acs = acRepository.findByDistrictDistrictId(districtId);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"FeatureCollection\",\"features\":[");

        for (int i = 0; i < acs.size(); i++) {
            AC ac = acs.get(i);

            sb.append("{\"type\":\"Feature\",\"properties\":{\"acNumber\":")
              .append(ac.getAcNumber())
              .append(",\"name\":\"")
              .append(ac.getName())
              .append("\",\"districtId\":\"")
              .append(ac.getDistrict() != null ? ac.getDistrict().getDistrictId() : "")
              .append("\"},\"geometry\":")
              .append(ac.getGeoJson() != null ? ac.getGeoJson() : "null")
              .append("}");

            if (i < acs.size() - 1) sb.append(",");
        }

        sb.append("]}");

        return ResponseEntity.ok(sb.toString());
    }
}