package com.diamond.backend.model;

import jakarta.persistence.*;

/**
 * Represents one section/area within a BoothPart.
 * Data sourced from delhi_cantt.json for AC 38 (Delhi Cantt).
 * Each BoothPart can have multiple BoothSections.
 */
@Entity
@Table(name = "booth_sections")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BoothSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** sectionId from the source JSON (local within a part, not globally unique) */
    @Column(name = "section_id", nullable = false)
    private Integer sectionId;

    @Column(name = "section_name", nullable = false, columnDefinition = "TEXT")
    private String sectionName;

    /** Many sections belong to one booth part */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_part_id", nullable = false)
    private BoothPart boothPart;

    // ── Constructors ──────────────────────────────────────────────────────────
    public BoothSection() {}

    public BoothSection(Integer sectionId, String sectionName, BoothPart boothPart) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.boothPart = boothPart;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSectionId() { return sectionId; }
    public void setSectionId(Integer sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public BoothPart getBoothPart() { return boothPart; }
    public void setBoothPart(BoothPart boothPart) { this.boothPart = boothPart; }
}
