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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    private Integer age;

    @Enumerated(EnumType.STRING)
    private MaritalStatus maritalStatus;

    @Column(nullable = false)
    private String district;

    @Column(name = "assembly_constituency_ac", nullable = false)
    private String assemblyConstituencyAc;

    @Column(nullable = false)
    private String boothId;

    private String houseNumber;
    private Integer partNumber;
    private String partName;
    private String section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AreaType area;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CasteCategory casteCategory;

    @Column(name = "disability")
    private boolean isDisability = false;
    
    @Column(name = "minority")
    private boolean isMinority = false;

    // Education & Economic
    @Column(name = "student")
    private boolean isStudent = false;
    
    @Column(name = "bpl")
    private boolean isBpl = false;
    
    private Integer annualIncome;

    // Employment
    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus;

    @Column(name = "government_employee")
    private boolean isGovernmentEmployee = false;

    @Enumerated(EnumType.STRING)
    private Occupation occupation;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Enums
    public enum Gender { Male, Female, Non_Binary, Other }
    public enum MaritalStatus { Single, Married, Widowed, Divorced }
    public enum AreaType { Urban, Rural }
    public enum CasteCategory { General, OBC, SC, ST, PVTG, DNT }
    public enum EmploymentStatus { Employed, Unemployed, Self_Employed }
    public enum Occupation {
        EX_SERVICEMEN("Ex Servicemen"),
        SAFAI_KARAMCHARI("Safai Karamchari"),
        HEALTH_WORKER("Health Worker"),
        STREET_VENDOR("Street Vendor"),
        UNORGANIZED_WORKER("Unorganized Worker"),
        ARTIST("Artist"),
        SPORTSPERSON("Sportsperson"),
        JOURNALIST("Journalist"),
        TEA_AND_EX_TEA_GARDEN_TRIBES("Tea and Ex-Tea Garden Tribes"),
        COIR_WORKER("Coir Worker"),
        KHADI_ARTISAN("Khadi Artisan"),
        FARMER("Farmer"),
        FISHERMEN("Fishermen"),
        ARTISANS_SPINNERS_AND_WEAVERS("Artisans, Spinners and Weavers"),
        TEACHER_OR_FACULTY("Teacher or Faculty"),
        CONSTRUCTION_WORKER("Construction Worker"),
        ORGANIZED_WORKER("Organized Worker");

        private final String label;
        Occupation(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVoterId() { return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public MaritalStatus getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(MaritalStatus maritalStatus) { this.maritalStatus = maritalStatus; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getAssemblyConstituencyAc() { return assemblyConstituencyAc; }
    public void setAssemblyConstituencyAc(String assemblyConstituencyAc) { this.assemblyConstituencyAc = assemblyConstituencyAc; }
    public String getBoothId() { return boothId; }
    public void setBoothId(String boothId) { this.boothId = boothId; }
    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
    public Integer getPartNumber() { return partNumber; }
    public void setPartNumber(Integer partNumber) { this.partNumber = partNumber; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public AreaType getArea() { return area; }
    public void setArea(AreaType area) { this.area = area; }
    public CasteCategory getCasteCategory() { return casteCategory; }
    public void setCasteCategory(CasteCategory casteCategory) { this.casteCategory = casteCategory; }
    public boolean isDisability() { return isDisability; }
    public void setDisability(boolean disability) { isDisability = disability; }
    public boolean isMinority() { return isMinority; }
    public void setMinority(boolean minority) { isMinority = minority; }
    public boolean isStudent() { return isStudent; }
    public void setStudent(boolean student) { isStudent = student; }
    public boolean isBpl() { return isBpl; }
    public void setBpl(boolean bpl) { isBpl = bpl; }
    public Integer getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(Integer annualIncome) { this.annualIncome = annualIncome; }
    public EmploymentStatus getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(EmploymentStatus employmentStatus) { this.employmentStatus = employmentStatus; }
    public boolean isGovernmentEmployee() { return isGovernmentEmployee; }
    public void setGovernmentEmployee(boolean governmentEmployee) { isGovernmentEmployee = governmentEmployee; }
    public Occupation getOccupation() { return occupation; }
    public void setOccupation(Occupation occupation) { this.occupation = occupation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

