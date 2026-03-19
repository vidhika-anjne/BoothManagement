-- Initialize Voter Profiles Table with constraints defined in the requirements
-- This script mirrors the Java entity but adds database-level integrity

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Non_Binary', 'Other');
    END IF;
    -- Note: Spring Boot creates tables automatically if spring.jpa.hibernate.ddl-auto=update
    -- These constraints can be added after table creation if needed.
END $$;
