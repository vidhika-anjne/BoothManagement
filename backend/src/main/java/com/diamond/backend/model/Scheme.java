package com.diamond.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "schemes")
public class Scheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scheme_name", nullable = false)
    private String schemeName;

    private String abbreviation;

    @Column(name = "scheme_type")
    private String type;

    private String ministry;

    @ElementCollection
    @CollectionTable(name = "scheme_beneficiaries", joinColumns = @JoinColumn(name = "scheme_id"))
    @Column(name = "beneficiary")
    private List<String> beneficiaries;

    @Column(columnDefinition = "TEXT")
    private String beneficiariesText;

    private Integer ageMin;
    private Integer ageMax;

    @ElementCollection
    @CollectionTable(name = "scheme_genders", joinColumns = @JoinColumn(name = "scheme_id"))
    @Column(name = "gender")
    private List<String> gender;

    @Column(columnDefinition = "TEXT")
    private String objectiveText;

    private String tenureText;

    // Financial Benefit nested data (optional, simplified as JSON or separate columns)
    private Integer amountPerYear;
    private Integer installments;
    private Integer amountPerInstallment;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }
    public String getAbbreviation() { return abbreviation; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }
    public List<String> getBeneficiaries() { return beneficiaries; }
    public void setBeneficiaries(List<String> beneficiaries) { this.beneficiaries = beneficiaries; }
    public String getBeneficiariesText() { return beneficiariesText; }
    public void setBeneficiariesText(String beneficiariesText) { this.beneficiariesText = beneficiariesText; }
    public Integer getAgeMin() { return ageMin; }
    public void setAgeMin(Integer ageMin) { this.ageMin = ageMin; }
    public Integer getAgeMax() { return ageMax; }
    public void setAgeMax(Integer ageMax) { this.ageMax = ageMax; }
    public List<String> getGender() { return gender; }
    public void setGender(List<String> gender) { this.gender = gender; }
    public String getObjectiveText() { return objectiveText; }
    public void setObjectiveText(String objectiveText) { this.objectiveText = objectiveText; }
    public String getTenureText() { return tenureText; }
    public void setTenureText(String tenureText) { this.tenureText = tenureText; }
    public Integer getAmountPerYear() { return amountPerYear; }
    public void setAmountPerYear(Integer amountPerYear) { this.amountPerYear = amountPerYear; }
    public Integer getInstallments() { return installments; }
    public void setInstallments(Integer installments) { this.installments = installments; }
    public Integer getAmountPerInstallment() { return amountPerInstallment; }
    public void setAmountPerInstallment(Integer amountPerInstallment) { this.amountPerInstallment = amountPerInstallment; }
}
