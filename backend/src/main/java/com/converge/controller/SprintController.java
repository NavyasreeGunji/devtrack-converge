package com.converge.controller;

import com.converge.entity.Sprint;
import com.converge.repository.SprintRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintRepository repository;

    public SprintController(SprintRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Sprint> list() {
        return repository.findAll();
    }

    @GetMapping("/team/{teamId}")
    public List<Sprint> byTeam(@PathVariable Long teamId) {
        return repository.findByTeamId(teamId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sprint create(@RequestBody Sprint sprint) {
        return repository.save(sprint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> update(@PathVariable Long id, @RequestBody Sprint sprint) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        sprint.setId(id);
        return ResponseEntity.ok(repository.save(sprint));
    }
}
