package com.converge.controller;

import com.converge.entity.Developer;
import com.converge.repository.DeveloperRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DeveloperRepository repository;

    public AuthController(DeveloperRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password required"));
        }

        Developer dev = repository.findByUsername(username.trim().toLowerCase()).orElse(null);
        if (dev == null || !password.equals(dev.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
        return ResponseEntity.ok(dev);
    }
}
