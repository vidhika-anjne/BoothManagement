package com.diamond.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voter_profiles")
public class Voter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String voterId;

    @Column(nullable = false)
    private String name;

    private Integer age;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    private MaritalStatus maritalStatus;

    @Column(nullable = false)
    private String district = "Digital District";

    @Column(name = "assembly_constituency_ac", nullable = false)
    private String assemblyConstituency = "AC-01";

    @Enumerated(EnumType.STRING)
    private AreaType area;

    @Enumerated(EnumType.STRING)
    private CasteCategory casteCategory;

    @Column(nullable = false)
    private Long partId;

    private String houseNumber;
    private Integer partNumber;
    private String partName;
    private String section;
    private String mobileNumber;

    private Boolean disability = false;
    private Boolean minority = false;
    private Boolean student = false;
    private Boolean bpl = false;
    private Integer annualIncome = 0;
    private Boolean governmentEmployee = false;

    @Enumerated(EnumType.STRING)
    private Occupation occupation;

    private String domain;

    @Enumerated(EnumType.STRING)
    private VoterStatus status = VoterStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Voter() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVoterId() { return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public MaritalStatus getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(MaritalStatus maritalStatus) { this.maritalStatus = maritalStatus; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getAssemblyConstituency() { return assemblyConstituency; }
    public void setAssemblyConstituency(String assemblyConstituency) { this.assemblyConstituency = assemblyConstituency; }
    public AreaType getArea() { return area; }
    public void setArea(AreaType area) { this.area = area; }
    public CasteCategory getCasteCategory() { return casteCategory; }
    public void setCasteCategory(CasteCategory casteCategory) { this.casteCategory = casteCategory; }
    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }
    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
    public Integer getPartNumber() { return partNumber; }
    public void setPartNumber(Integer partNumber) { this.partNumber = partNumber; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public Boolean getDisability() { return disability; }
    public void setDisability(Boolean disability) { this.disability = disability; }
    public Boolean getMinority() { return minority; }
    public void setMinority(Boolean minority) { this.minority = minority; }
    public Boolean getStudent() { return student; }
    public void setStudent(Boolean student) { this.student = student; }
    public Boolean getBpl() { return bpl; }
    public void setBpl(Boolean bpl) { this.bpl = bpl; }
    public Integer getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(Integer annualIncome) { this.annualIncome = annualIncome; }
    public Boolean getGovernmentEmployee() { return governmentEmployee; }
    public void setGovernmentEmployee(Boolean governmentEmployee) { this.governmentEmployee = governmentEmployee; }
    public Occupation getOccupation() { return occupation; }
    public void setOccupation(Occupation occupation) { this.occupation = occupation; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public VoterStatus getStatus() { return status; }
    public void setStatus(VoterStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods for Logic
    public boolean isGovernmentEmployee() { return governmentEmployee != null && governmentEmployee; }
    public boolean isStudent() { return student != null && student; }
    public boolean isBpl() { return bpl != null && bpl; }
    public boolean isMinority() { return minority != null && minority; }
    public boolean isDisability() { return disability != null && disability; }
    
    public EmploymentStatus getEmploymentStatus() {
        if (isGovernmentEmployee()) return EmploymentStatus.Employed;
        if (isStudent()) return EmploymentStatus.Student;
        return EmploymentStatus.Unemployed;
    }
}
