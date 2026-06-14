package com.converge.controller;

import com.converge.repository.BugRepository;
import com.converge.repository.DailyStatusRepository;
import com.converge.repository.StoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StoryRepository storyRepository;
    private final BugRepository bugRepository;
    private final DailyStatusRepository dailyStatusRepository;
    public DashboardController(StoryRepository storyRepository,
                                BugRepository bugRepository,
                                DailyStatusRepository dailyStatusRepository) {
        this.storyRepository = storyRepository;
        this.bugRepository = bugRepository;
        this.dailyStatusRepository = dailyStatusRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        long totalStories = storyRepository.count();
        long doneStories = storyRepository.findAll().stream()
                .filter(s -> "done".equals(s.getStatus())).count();
        int totalPoints = storyRepository.findAll().stream()
                .mapToInt(s -> s.getPoints() != null ? s.getPoints() : 0).sum();
        int donePoints = storyRepository.findAll().stream()
                .filter(s -> "done".equals(s.getStatus()))
                .mapToInt(s -> s.getPoints() != null ? s.getPoints() : 0).sum();
        long openBugs = bugRepository.findAll().stream()
                .filter(b -> "open".equals(b.getStatus()) || "in_progress".equals(b.getStatus())).count();
        long criticalBugs = bugRepository.findAll().stream()
                .filter(b -> "critical".equals(b.getSeverity())
                        && !"closed".equals(b.getStatus())
                        && !"resolved".equals(b.getStatus())).count();
        long totalLogs = dailyStatusRepository.count();

        return Map.of(
                "totalStories", totalStories,
                "doneStories", doneStories,
                "totalPoints", totalPoints,
                "donePoints", donePoints,
                "openBugs", openBugs,
                "criticalBugs", criticalBugs,
                "totalLogs", totalLogs
        );
    }
}
