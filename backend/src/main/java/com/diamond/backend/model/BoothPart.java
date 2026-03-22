package com.diamond.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single polling booth/part within an Assembly Constituency.
 * Data sourced from booths.json (all Delhi constituencies).
 * For Delhi Cantt (AC 38), the associated sections are stored in BoothSection.
 */
@Entity
@Table(name = "booth_parts")
public class BoothPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Source identifier from the JSON (not unique across districts) */
    @Column(name = "part_id", nullable = false)
    private Long partId;

    @Column(name = "part_number", nullable = false)
    private Integer partNumber;

    @Column(name = "part_name", nullable = false)
    private String partName;

    // ── Assembly Constituency ──────────────────────────────────────────────────
    @Column(name = "ac_number")
    private Integer acNumber;

    @Column(name = "ac_name")
    private String acName;

    // ── District ───────────────────────────────────────────────────────────────
    @Column(name = "district_id")
    private String districtId;

    @Column(name = "district_name")
    private String districtName;

    // ── Polling station details (only populated for Delhi Cantt parts) ─────────
    @Column(name = "polling_station_name")
    private String pollingStationName;

    @Column(name = "polling_station_address", columnDefinition = "TEXT")
    private String pollingStationAddress;

    // ── One-to-many: a booth part can have many sections ─────────────────────
    @OneToMany(mappedBy = "boothPart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BoothSection> sections = new ArrayList<>();

    // ── Constructors ──────────────────────────────────────────────────────────
    public BoothPart() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }

    public Integer getPartNumber() { return partNumber; }
    public void setPartNumber(Integer partNumber) { this.partNumber = partNumber; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public Integer getAcNumber() { return acNumber; }
    public void setAcNumber(Integer acNumber) { this.acNumber = acNumber; }

    public String getAcName() { return acName; }
    public void setAcName(String acName) { this.acName = acName; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getPollingStationName() { return pollingStationName; }
    public void setPollingStationName(String pollingStationName) { this.pollingStationName = pollingStationName; }

    public String getPollingStationAddress() { return pollingStationAddress; }
    public void setPollingStationAddress(String pollingStationAddress) { this.pollingStationAddress = pollingStationAddress; }

    public List<BoothSection> getSections() { return sections; }
    public void setSections(List<BoothSection> sections) { this.sections = sections; }
}
