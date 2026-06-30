package com.criska.controller;

import com.criska.entity.DailyStatus;
import com.criska.repository.DailyStatusRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/status")
public class DailyStatusController {

    private final DailyStatusRepository repository;

    public DailyStatusController(DailyStatusRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<DailyStatus> list() {
        return repository.findAll();
    }

    @GetMapping("/developer/{developer}")
    public List<DailyStatus> byDeveloper(@PathVariable("developer") String developer) {
        return repository.findByDeveloper(developer);
    }

    @GetMapping("/date/{date}")
    public List<DailyStatus> byDate(@PathVariable("date") String date) {
        return repository.findByDate(LocalDate.parse(date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DailyStatus> get(@PathVariable("id") Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DailyStatus create(@RequestBody DailyStatus dailyStatus) {
        return repository.save(dailyStatus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailyStatus> update(@PathVariable("id") Long id, @RequestBody DailyStatus dailyStatus) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        dailyStatus.setId(id);
        return ResponseEntity.ok(repository.save(dailyStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
