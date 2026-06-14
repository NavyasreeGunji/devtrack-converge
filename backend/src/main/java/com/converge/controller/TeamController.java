package com.converge.controller;

import com.converge.entity.Team;
import com.converge.repository.TeamRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository repository;

    public TeamController(TeamRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Team> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Team create(@RequestBody Team team) {
        return repository.save(team);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> update(@PathVariable Long id, @RequestBody Team team) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        team.setId(id);
        return ResponseEntity.ok(repository.save(team));
    }
}
