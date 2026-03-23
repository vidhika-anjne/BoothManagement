package com.diamond.backend.controller;

import com.diamond.backend.model.Voter;
import com.diamond.backend.repository.VoterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Handles demo citizen login via mobile number.
 *
 * <pre>
 * POST /api/citizen/login   body: { "mobileNumber": "9XXXXXXXXX" }
 * </pre>
 *
 * Returns the full voter profile on success (OTP is demo, always passes on frontend).
 */
@RestController
@RequestMapping("/api/citizen")
@CrossOrigin(origins = "*")
public class CitizenAuthController {

    @Autowired
    private VoterRepository voterRepository;

    /**
     * Lookup voter by mobile number.
     * Returns 200 with voter data if found, 404 if not registered.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String mobile = body.getOrDefault("mobileNumber", "").trim();

        if (mobile.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "mobileNumber is required"));
        }

        Optional<Voter> voterOpt = voterRepository.findByMobileNumber(mobile);
        if (voterOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "No voter registered with this mobile number."));
        }

        Voter v = voterOpt.get();

        // Return a sanitised profile (no DB id)
        return ResponseEntity.ok(Map.ofEntries(
                Map.entry("voterId",          v.getVoterId()),
                Map.entry("name",             v.getName()),
                Map.entry("gender",           v.getGender() != null ? v.getGender().name() : ""),
                Map.entry("age",              v.getAge() != null ? v.getAge() : 0),
                Map.entry("maritalStatus",    v.getMaritalStatus() != null ? v.getMaritalStatus().name() : ""),
                Map.entry("district",         v.getDistrict()),
                Map.entry("assemblyConstituencyAc", v.getAssemblyConstituencyAc()),
                Map.entry("partId",           v.getPartId() != null ? v.getPartId() : 0),
                Map.entry("houseNumber",      v.getHouseNumber() != null ? v.getHouseNumber() : ""),
                Map.entry("partNumber",       v.getPartNumber() != null ? v.getPartNumber() : 0),
                Map.entry("partName",         v.getPartName() != null ? v.getPartName() : ""),
                Map.entry("section",          v.getSection() != null ? v.getSection() : ""),
                Map.entry("area",             v.getArea() != null ? v.getArea().name() : "Urban"),
                Map.entry("casteCategory",    v.getCasteCategory() != null ? v.getCasteCategory().name() : "General"),
                Map.entry("isDisability",     v.isDisability()),
                Map.entry("isMinority",       v.isMinority()),
                Map.entry("isStudent",        v.isStudent()),
                Map.entry("isBpl",            v.isBpl()),
                Map.entry("annualIncome",     v.getAnnualIncome() != null ? v.getAnnualIncome() : 0),
                Map.entry("employmentStatus", v.getEmploymentStatus() != null ? v.getEmploymentStatus().name() : ""),
                Map.entry("isGovernmentEmployee", v.isGovernmentEmployee()),
                Map.entry("occupation",       v.getOccupation() != null ? v.getOccupation().name() : ""),
                Map.entry("mobileNumber",     v.getMobileNumber() != null ? v.getMobileNumber() : "")
        ));
    }
}
