package com.diamond.backend.repository;

import com.diamond.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByBoothId(Long boothId);
    List<Notification> findByStatus(String status);
    
    @Query("SELECT n FROM Notification n WHERE n.boothId = :boothId ORDER BY n.createdAt DESC")
    List<Notification> findByBoothIdOrderByCreatedAtDesc(@Param("boothId") Long boothId);
}
