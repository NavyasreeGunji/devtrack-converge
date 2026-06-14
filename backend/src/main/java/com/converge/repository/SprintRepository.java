package com.converge.repository;

import com.converge.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByTeamId(Long teamId);
}
