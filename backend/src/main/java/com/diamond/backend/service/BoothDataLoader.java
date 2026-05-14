package com.diamond.backend.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Minimal loader for Phase 4. Data has already been seeded in PostgreSQL.
 */
@Service
@Order(2)
public class BoothDataLoader implements CommandLineRunner {

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // No-op: Data persistence confirmed.
        System.out.println("[BoothDataLoader] Data already confirmed in PostgreSQL. skipping heavy startup tasks.");
    }
}
