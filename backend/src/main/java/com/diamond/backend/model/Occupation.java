package com.diamond.backend.model;

public enum Occupation {
    SAFAI_KARAMCHARI("Safai Karamchari"), 
    FARMER("Farmer"), 
    BUSINESS("Business"), 
    SERVICE("Service"), 
    OTHERS("Others"),
    STREET_VENDOR("Street Vendor"),
    UNORGANIZED_WORKER("Unorganized Worker"),
    EX_SERVICEMEN("Ex-Servicemen"),
    FISHERMEN("Fishermen"),
    ARTISANS_SPINNERS_AND_WEAVERS("Artisans, Spinners and Weavers"),
    KHADI_ARTISAN("Khadi Artisan"),
    COIR_WORKER("Coir Worker"),
    CONSTRUCTION_WORKER("Construction Worker"),
    HEALTH_WORKER("Health Worker"),
    ARTIST("Artist"),
    SPORTSPERSON("Sportsperson"),
    JOURNALIST("Journalist"),
    TEA_AND_EX_TEA_GARDEN_TRIBES("Tea and Ex-Tea Garden Tribes"),
    TEACHER_OR_FACULTY("Teacher or Faculty"),
    ORGANIZED_WORKER("Organized Worker"),
    PVTG("PVTG"),
    Self_Employed("Self-Employed");

    private final String label;
    Occupation(String label) { this.label = label; }
    public String getLabel() { return label; }
}
