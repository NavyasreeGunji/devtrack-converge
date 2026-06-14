package com.converge.controller;

import com.converge.entity.Story;
import com.converge.repository.StoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryRepository repository;

    public StoryController(StoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Story> list() {
        return repository.findAll();
    }

    @GetMapping("/team/{teamId}")
    public List<Story> byTeam(@PathVariable("teamId") Long teamId) {
        return repository.findByTeamId(teamId);
    }

    @GetMapping("/sprint/{sprintId}")
    public List<Story> bySprint(@PathVariable("sprintId") Long sprintId) {
        return repository.findBySprintId(sprintId);
    }

    @GetMapping("/assignee/{assignee}")
    public List<Story> byAssignee(@PathVariable("assignee") String assignee) {
        return repository.findByAssignee(assignee);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Story> get(@PathVariable("id") Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Story create(@RequestBody Story story) {
        return repository.save(story);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Story> update(@PathVariable("id") Long id, @RequestBody Story story) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        story.setId(id);
        return ResponseEntity.ok(repository.save(story));
    }
}
