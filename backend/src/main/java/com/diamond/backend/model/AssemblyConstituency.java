package com.diamond.backend.model;

import jakarta.persistence.*;

@Entity
public class AssemblyConstituency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Long districtId;

    // getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public Long getDistrictId() { return districtId; }

    // setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }
}