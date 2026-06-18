package com.converge.controller;

import com.converge.entity.Developer;
import com.converge.repository.DeveloperRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/developers")
public class DeveloperController {

    private final DeveloperRepository repository;

    public DeveloperController(DeveloperRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Developer> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Developer> get(@PathVariable("id") Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Developer create(@RequestBody Developer developer) {
        return repository.save(developer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Developer> update(@PathVariable("id") Long id, @RequestBody Developer developer) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        developer.setId(id);
        return ResponseEntity.ok(repository.save(developer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
