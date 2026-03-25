package com.diamond.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "acs")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AC {

    @Id
    @Column(name = "ac_number")
    private Integer acNumber;

    private String name;

    @jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "district_id")
    private District district;

    @Column(name = "geo_json", columnDefinition = "TEXT")
    private String geoJson;

    public AC() {}

    public AC(Integer acNumber, String name, District district, String geoJson) {
        this.acNumber = acNumber;
        this.name = name;
        this.district = district;
        this.geoJson = geoJson;
    }

    public Integer getAcNumber() { return acNumber; }
    public void setAcNumber(Integer acNumber) { this.acNumber = acNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }

    public String getGeoJson() { return geoJson; }
    public void setGeoJson(String geoJson) { this.geoJson = geoJson; }
}
