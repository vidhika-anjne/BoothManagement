package com.diamond.backend.repository;

import com.diamond.backend.model.Notification;
import com.diamond.backend.model.NotificationChannel;
import com.diamond.backend.model.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByOrderByCreatedAtDesc(Pageable pageable);

    Page<Notification> findByVoterIdOrderByCreatedAtDesc(Long voterId, Pageable pageable);

    Page<Notification> findByStatusOrderByCreatedAtDesc(NotificationStatus status, Pageable pageable);

    Page<Notification> findByChannelOrderByCreatedAtDesc(NotificationChannel channel, Pageable pageable);

    List<Notification> findByBulkBatchIdOrderByCreatedAtDesc(String bulkBatchId);

    @Query("SELECT n FROM Notification n WHERE n.status IN ('FAILED', 'RETRYING') " +
           "AND n.retryCount < n.maxRetries " +
           "AND (n.nextRetryAt IS NULL OR n.nextRetryAt <= :now) " +
           "ORDER BY n.priority ASC, n.nextRetryAt ASC")
    List<Notification> findEligibleForRetry(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.status = :status")
    Long countByStatus(@Param("status") NotificationStatus status);

    @Query("SELECT n.channel AS channel, COUNT(n) AS total, " +
           "SUM(CASE WHEN n.status = 'SENT' OR n.status = 'DELIVERED' THEN 1 ELSE 0 END) AS success, " +
           "SUM(CASE WHEN n.status = 'FAILED' THEN 1 ELSE 0 END) AS failed " +
           "FROM Notification n GROUP BY n.channel")
    List<Object[]> getChannelStatistics();

    @Query("SELECT n.status AS status, COUNT(n) AS count FROM Notification n GROUP BY n.status")
    List<Object[]> getStatusStatistics();

    @Query("SELECT n FROM Notification n WHERE n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("since") LocalDateTime since);

    Long countByBulkBatchId(String bulkBatchId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.bulkBatchId = :batchId AND n.status IN ('SENT', 'DELIVERED')")
    Long countSuccessfulByBulkBatchId(@Param("batchId") String batchId);
}
