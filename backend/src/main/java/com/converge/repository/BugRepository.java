package com.converge.repository;

import com.converge.entity.Bug;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BugRepository extends JpaRepository<Bug, Long> {
    List<Bug> findByStatus(String status);
    List<Bug> findByAssignee(String assignee);
    List<Bug> findByEnvironment(String environment);
}
