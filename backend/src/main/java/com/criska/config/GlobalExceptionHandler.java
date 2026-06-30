package com.criska.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handle(Exception e) {
        String msg = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
        System.err.println("[ERROR] " + e.getClass().getSimpleName() + ": " + msg);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Internal Server Error",
                        "message", msg != null ? msg : e.getClass().getSimpleName()
                ));
    }
}
