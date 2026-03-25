package com.diamond.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "districts")
public class District {

    @Id
    @Column(name = "district_id")
    private String districtId;

    private String name;

    @Column(name = "geo_json", columnDefinition = "TEXT")
    private String geoJson;

    public District() {}

    public District(String districtId, String name, String geoJson) {
        this.districtId = districtId;
        this.name = name;
        this.geoJson = geoJson;
    }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGeoJson() { return geoJson; }
    public void setGeoJson(String geoJson) { this.geoJson = geoJson; }
}
