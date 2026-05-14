package com.diamond.backend.controller;

import com.diamond.backend.model.Voter;
import com.diamond.backend.service.VoterService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/voters")
@CrossOrigin(origins = "*") // For demo simplicity
public class VoterController {

    private final VoterService voterService;

    public VoterController(VoterService voterService) {
        this.voterService = voterService;
    }

    @GetMapping
    public Page<Voter> getVoters(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", defaultValue = "All") String status,
            @RequestParam(name = "partId", defaultValue = "All") String partId,
            @RequestParam(name = "domain", defaultValue = "All") String domain,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "id,desc") String sort) {

        String[] sortParts = sort.split(",");
        Sort sortObj = Sort.by(Sort.Direction.fromString(sortParts[1]), sortParts[0]);
        
        return voterService.getVoters(search, status, partId, domain, PageRequest.of(page, size, sortObj));
    }

    @GetMapping("/stats")
    public Map<String, Object> getVoterStats() {
        return voterService.getVoterStats();
    }

    @PostMapping
    public Voter addVoter(@RequestBody Voter voter) {
        System.out.println("[VoterController] Received addVoter request for: " + voter.getName() + ", PartId: " + voter.getPartId() + ", VoterId: " + voter.getVoterId());
        return voterService.addVoter(voter);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportVoters(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", defaultValue = "All") String status,
            @RequestParam(name = "partId", defaultValue = "All") String partId,
            @RequestParam(name = "domain", defaultValue = "All") String domain) {

        String csv = voterService.exportToCsv(search, status, partId, domain);
        byte[] data = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=voters_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(data.length)
                .body(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoter(@PathVariable("id") Long id) {
        voterService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
