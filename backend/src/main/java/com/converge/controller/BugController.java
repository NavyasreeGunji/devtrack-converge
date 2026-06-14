package com.converge.controller;

import com.converge.entity.Bug;
import com.converge.repository.BugRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bugs")
public class BugController {

    private final BugRepository repository;

    public BugController(BugRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Bug> list() {
        return repository.findAll();
    }

    @GetMapping("/status/{status}")
    public List<Bug> byStatus(@PathVariable("status") String status) {
        return repository.findByStatus(status);
    }

    @GetMapping("/assignee/{assignee}")
    public List<Bug> byAssignee(@PathVariable("assignee") String assignee) {
        return repository.findByAssignee(assignee);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bug> get(@PathVariable("id") Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Bug create(@RequestBody Bug bug) {
        return repository.save(bug);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bug> update(@PathVariable("id") Long id, @RequestBody Bug bug) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        bug.setId(id);
        return ResponseEntity.ok(repository.save(bug));
    }
}
