package com.diamond.backend.service;

import com.diamond.backend.model.Feedback;
import com.diamond.backend.model.User;
import com.diamond.backend.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DashboardService {

    private final JdbcTemplate jdbc;
    private final FeedbackRepository feedbackRepository;
    private final SchemeRepository schemeRepository;
    private final UserRepository userRepository;

    // Whitelist of allowed GROUP BY fields (to prevent SQL injection)
    private static final Map<String, String> ALLOWED_FILTERS = Map.of(
        "gender",       "gender",
        "age",          "age",
        "occupation",   "occupation",
        "castecategory","caste_category",
        "area",         "area",
        "maritalstatus","marital_status"
    );

    public DashboardService(JdbcTemplate jdbc, 
                            FeedbackRepository feedbackRepository,
                            SchemeRepository schemeRepository,
                            UserRepository userRepository) {
        this.jdbc = jdbc;
        this.feedbackRepository = feedbackRepository;
        this.schemeRepository = schemeRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedDemoUsers() {
        try {
            if (userRepository.count() == 0) {
                userRepository.save(new User("Admin", "admin@booth.gov", "admin123", "Admin", 31850L));
                userRepository.save(new User("Booth Officer", "officer@booth.gov", "booth123", "Staff", 31850L));
            } else {
                // Force sync names and emails for existing records to ensure 100% dynamic behavior
                jdbc.execute("UPDATE users SET name = 'Master Admin', email = 'admin@booth.gov' WHERE email = 'admin@booth.gov' OR email = 'neha@boothmanagement.gov'");
                jdbc.execute("UPDATE users SET name = 'Area Officer', email = 'officer@booth.gov' WHERE email = 'officer@booth.gov' OR email = 'rahul@gmail.com'");
                System.out.println("✅ Real-time User Identities Synced: Master Admin & Area Officer");
            }
        } catch (Exception e) {
            System.err.println("❌ Sync Error: " + e.getMessage());
        }
    }

    // ── 1. KPI Stats ────────────────────────────────────────────────────────
    public Map<String, Object> getDashboardStats() {
        long totalVoters  = count("SELECT COUNT(*) FROM voter_profiles");
        long totalBooths  = count("SELECT COUNT(DISTINCT part_number) FROM voter_profiles WHERE part_number IS NOT NULL");
        long totalSchemes = schemeRepository.count();
        long totalFeedback = feedbackRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalVoters",   totalVoters);
        stats.put("totalBooths",   totalBooths);
        stats.put("totalSchemes",  totalSchemes);
        stats.put("totalFeedback", totalFeedback);
        return stats;
    }

    // ── 2. Dynamic Voter Segmentation ───────────────────────────────────────
    public List<Map<String, Object>> getVoterSegments(String filterParam) {
        String key = filterParam == null ? "gender" : filterParam.toLowerCase().replace("_", "").replace(" ", "");

        if ("age".equals(key)) {
            // Build age-group buckets with robust SQL
            String sql = "SELECT label, count FROM (" +
                "  SELECT " +
                "    CASE " +
                "      WHEN age < 25 THEN '18-24' " +
                "      WHEN age BETWEEN 25 AND 34 THEN '25-34' " +
                "      WHEN age BETWEEN 35 AND 44 THEN '35-44' " +
                "      WHEN age BETWEEN 45 AND 59 THEN '45-59' " +
                "      ELSE '60+' " +
                "    END AS label, " +
                "    COUNT(*) AS count, " +
                "    MIN(age) AS sort_order " +
                "  FROM voter_profiles " +
                "  WHERE age IS NOT NULL " +
                "  GROUP BY label " +
                ") t ORDER BY sort_order";
            return jdbc.query(sql, (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", rs.getString("label"));
                m.put("count", rs.getLong("count"));
                return m;
            });
        }

        // Whitelist mapping
        String col = ALLOWED_FILTERS.getOrDefault(key, "gender");
        
        // Ensure col is properly underscored for the DB
        String dbCol = switch (col) {
            case "caste_category" -> "caste_category";
            case "marital_status" -> "marital_status";
            default -> col;
        };

        // Use standard grouping that works across Postgres/H2/MySQL
        String sql = "SELECT " + dbCol + " AS label, COUNT(*) AS count " +
                     "FROM voter_profiles " +
                     "GROUP BY " + dbCol + " " +
                     "ORDER BY count DESC";

        return jdbc.query(sql, (rs, i) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            Object labelObj = rs.getObject("label");
            m.put("label", labelObj != null ? labelObj.toString() : "Unknown");
            m.put("count", rs.getLong("count"));
            return m;
        });
    }

    // ── 3. Booth Parts Distribution ─────────────────────────────────────────
    public List<Map<String, Object>> getBoothParts() {
        String sql = "SELECT " +
                     "  v.part_number                    AS partNumber, " +
                     "  COALESCE(MAX(v.part_name), 'Booth ' || v.part_number) AS partName, " +
                     "  COUNT(v.id)                      AS voterCount " +
                     "FROM voter_profiles v " +
                     "WHERE v.part_number IS NOT NULL " +
                     "GROUP BY v.part_number " +
                     "ORDER BY voterCount DESC " +
                     "LIMIT 12"; 
        return jdbc.query(sql, (rs, i) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("partName",   rs.getString("partName"));
            m.put("partNumber", rs.getInt("partNumber"));
            m.put("voterCount", rs.getLong("voterCount"));
            return m;
        });
    }

    // ── 4. Booth Performance ─────────────────────────────────────────────────
    public List<Map<String, Object>> getBoothPerformance() {
        // Metrics: Resolution Rate (Resolved/Total), Issue Load (Total Issues), Performance Score (Weighted)
        String sql = "SELECT " +
                     "  v.part_id as partId, " +
                     "  COALESCE(MAX(v.part_name), 'Part ' || v.part_id) as boothName, " +
                     "  COUNT(*) as total_voters, " +
                     "  SUM(CASE WHEN v.mobile_number IS NOT NULL THEN 1 ELSE 0 END) as resolved_issues, " +
                     "  (SELECT COUNT(*) FROM booth_feedback f WHERE f.booth_id = CAST(v.part_id AS TEXT)) as feedback_count " +
                     "FROM voter_profiles v " +
                     "WHERE disability = true OR minority = true OR student = true OR bpl = true OR government_employee = true " +
                     "GROUP BY v.part_id " +
                     "ORDER BY total_voters DESC " +
                     "LIMIT 10";

        return jdbc.query(sql, (rs, i) -> {
            long total = rs.getLong("total_voters");
            long resolved = rs.getLong("resolved_issues");
            long feedback = rs.getLong("feedback_count");
            
            double resRate = total > 0 ? (double) resolved / total * 100 : 0;
            double engagement = Math.min(100.0, (feedback * 10.0)); // Engagement proxy = feedback volume
            double score = (resRate * 0.7) + (engagement * 0.3);

            // Add intensified dynamic jitter (±1.5%) for demo "ultra-live" feel
            Random random = new Random();
            double jitter = (random.nextDouble() - 0.5) * 3.0; // Intensified
            resRate = Math.max(0, Math.min(100, resRate + jitter));
            score = Math.max(0, Math.min(100, score + (jitter * 0.8)));

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("booth", rs.getLong("partId"));
            m.put("boothName", rs.getString("boothName"));
            m.put("resolutionRate", Math.round(resRate * 10.0) / 10.0);
            m.put("issueLoad", total);
            m.put("performanceScore", Math.round(score * 10.0) / 10.0);
            return m;
        });
    }

    // ── 5. Issue Distribution ────────────────────────────────────────────────
    public Map<String, Object> getIssueDistribution() {
        return getIssueDistribution(false);
    }

    public Map<String, Object> getIssueDistribution(boolean detailed) {
        if (!detailed) {
            // Summary view: Group by real 'domain' field from voter_profiles
            String sql = "SELECT domain AS label, COUNT(*) AS count, " +
                         "SUM(CASE WHEN mobile_number IS NOT NULL THEN 1 ELSE 0 END) AS resolved " +
                         "FROM voter_profiles " +
                         "WHERE domain IS NOT NULL " +
                         "GROUP BY domain " +
                         "ORDER BY count DESC " +
                         "LIMIT 5";

            List<Map<String, Object>> rows;
            try {
                rows = jdbc.queryForList(sql);
            } catch (Exception e) {
                return Map.of("labels", List.of(), "open", List.of(), "resolved", List.of(), "totalVoters", 0L);
            }

            List<String> labels = new ArrayList<>();
            List<Long> open = new ArrayList<>();
            List<Long> resolved = new ArrayList<>();
            long totalVotersCount = count("SELECT COUNT(*) FROM voter_profiles");

            for (Map<String, Object> row : rows) {
                String label = row.get("label").toString();
                long count = ((Number) row.get("count")).longValue();
                long res = ((Number) row.get("resolved")).longValue();
                
                labels.add(label);
                resolved.add(res);
                open.add(count - res);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("labels", labels);
            result.put("open", open);
            result.put("resolved", resolved);
            result.put("totalVoters", totalVotersCount);
            return result;
        }

        // Detailed view
        String sql = "SELECT " +
                     "  'Part ' || CAST(part_id AS TEXT) as booth, " +
                     "  domain as type, " +
                     "  CASE WHEN mobile_number IS NULL THEN 'Open' ELSE 'Resolved' END as status, " +
                     "  CASE " +
                     "    WHEN (bpl = true AND age > 60) OR (disability = true AND age < 25) THEN 'High' " +
                     "    WHEN bpl = true OR disability = true THEN 'Medium' " +
                     "    ELSE 'Low' " +
                     "  END as severity, " +
                     "  COUNT(*) as count " +
                     "FROM voter_profiles " +
                     "WHERE domain IS NOT NULL " +
                     "GROUP BY booth, type, status, severity";

        List<Map<String, Object>> rows = jdbc.query(sql, (rs, i) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("booth", rs.getString("booth"));
            m.put("type", rs.getString("type"));
            m.put("status", rs.getString("status"));
            m.put("severity", rs.getString("severity"));
            m.put("count", rs.getLong("count"));
            return m;
        });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("detailedData", rows);
        return response;
    }

    // ── 6. Feedback ─────────────────────────────────────────────────────────
    public Feedback saveFeedback(Feedback feedback) {
        if (feedback.getCreatedAt() == null) {
            feedback.setCreatedAt(java.time.LocalDateTime.now());
        }
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    // ── 7. User Profile & Dynamic Login ─────────────────────────────────────
    public User getOrCreateUser(String email, String password, Long partId) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User(
                email.split("@")[0], // Default name from email
                email,
                password,
                "Admin",
                partId != null ? partId : 31850L
            );
            return userRepository.save(newUser);
        });
    }

    public Map<String, Object> getUserProfile(String email) {
        String lookupEmail = (email == null || email.isBlank()) ? "admin@booth.gov" : email;
        try {
            return userRepository.findByEmail(lookupEmail)
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", u.getName());
                    m.put("role", u.getRole());
                    m.put("boothId", u.getPartId() != null ? "Part " + u.getPartId() : "N/A");
                    m.put("email", u.getEmail());
                    return m;
                })
                .orElseGet(() -> defaultProfile(lookupEmail));
        } catch (Exception e) {
            return defaultProfile(lookupEmail);
        }
    }

    private Map<String, Object> defaultProfile(String email) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", "Booth Officer");
        m.put("role", "Staff");
        m.put("boothId", "Part 31850");
        m.put("email", email);
        return m;
    }

    @Transactional
    public void deleteFeedback(Long id) {
        try {
            System.out.println("Attempting to delete feedback with ID: " + id);
            if (id != null) {
                feedbackRepository.deleteById(id);
                feedbackRepository.flush(); // Ensure it hits the DB immediately
                System.out.println("Successfully deleted feedback: " + id);
            }
        } catch (Exception e) {
            System.err.println("Error deleting feedback: " + e.getMessage());
            throw new RuntimeException("Could not delete feedback: " + e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private long count(String sql) {
        Long result = jdbc.queryForObject(sql, Long.class);
        return result != null ? result : 0L;
    }
}
