package com.criska.repository;

import com.criska.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findByDeployedBy(String deployedBy);
    List<Deployment> findByStatus(String status);
    List<Deployment> findByEnvironment(String environment);
}
