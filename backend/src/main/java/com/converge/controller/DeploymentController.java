package com.converge.controller;

import com.converge.entity.Deployment;
import com.converge.repository.DeploymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deployments")
public class DeploymentController {

    private final DeploymentRepository repository;

    public DeploymentController(DeploymentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Deployment> list() {
        return repository.findAll();
    }

    @GetMapping("/developer/{deployedBy}")
    public List<Deployment> byDeveloper(@PathVariable("deployedBy") String deployedBy) {
        return repository.findByDeployedBy(deployedBy);
    }

    @GetMapping("/status/{status}")
    public List<Deployment> byStatus(@PathVariable("status") String status) {
        return repository.findByStatus(status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deployment> get(@PathVariable("id") Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Deployment create(@RequestBody Deployment deployment) {
        return repository.save(deployment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deployment> update(@PathVariable("id") Long id, @RequestBody Deployment deployment) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        deployment.setId(id);
        return ResponseEntity.ok(repository.save(deployment));
    }
}
