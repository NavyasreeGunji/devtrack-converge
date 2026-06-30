package com.criska.controller;

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD RESET (OTP via company email)
//
// TO ENABLE:
//   1. Add to pom.xml:
//        <dependency>
//            <groupId>org.springframework.boot</groupId>
//            <artifactId>spring-boot-starter-mail</artifactId>
//        </dependency>
//
//   2. Uncomment the mail section in application.yml:
//        spring:
//          mail:
//            host: ${MAIL_HOST}
//            port: ${MAIL_PORT:587}
//            username: ${MAIL_USERNAME}
//            password: ${MAIL_PASSWORD}
//            properties:
//              mail:
//                smtp:
//                  auth: true
//                  starttls:
//                    enable: true
//
//   3. Set environment variables on Render:
//        MAIL_HOST     — your company SMTP host (e.g. smtp.office365.com)
//        MAIL_PORT     — 587
//        MAIL_USERNAME — your company email (e.g. Navya.G@criskasecurity.com)
//        MAIL_PASSWORD — your email password or app-specific password
//
//   4. Remove the block comment markers (/* and */) below to activate the class.
// ─────────────────────────────────────────────────────────────────────────────

/*

import com.criska.entity.Developer;
import com.criska.repository.DeveloperRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final DeveloperRepository repository;
    private final JavaMailSender mailSender;
    private final String fromAddress;

    private static final int OTP_EXPIRY_SECONDS = 600; // 10 minutes
    private final SecureRandom random = new SecureRandom();

    private record OtpEntry(String otp, Instant expiresAt) {}
    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public PasswordResetController(DeveloperRepository repository,
                                   JavaMailSender mailSender,
                                   @Value("${spring.mail.username}") String fromAddress) {
        this.repository = repository;
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    // POST /api/auth/send-otp
    // Body: { "username": "navya.sree" }
    // Response: { "maskedEmail": "n***@criskasecurity.com" }
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        Developer dev = repository.findByUsername(username.trim().toLowerCase()).orElse(null);
        if (dev == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No account found with that username"));
        }
        if (dev.getEmail() == null || dev.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No email address is associated with this account"));
        }

        try {
            String otp = String.format("%06d", random.nextInt(1_000_000));
            otpStore.put(username.trim().toLowerCase(),
                         new OtpEntry(otp, Instant.now().plusSeconds(OTP_EXPIRY_SECONDS)));

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(dev.getEmail());
            msg.setSubject("DevTrack — Your password reset OTP");
            msg.setText(
                "Hi,\n\n" +
                "Your OTP to reset your DevTrack password is:\n\n" +
                "  " + otp + "\n\n" +
                "This code is valid for 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "— CrisKa Security DevTrack"
            );
            mailSender.send(msg);

            String email = dev.getEmail();
            int atIdx = email.indexOf('@');
            String masked = email.substring(0, 1) + "***" + (atIdx > 1 ? email.substring(atIdx) : "");
            return ResponseEntity.ok(Map.of("maskedEmail", masked));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send OTP. Please try again."));
        }
    }

    // POST /api/auth/reset-password
    // Body: { "username": "navya.sree", "otp": "123456", "newPassword": "NewPass@123" }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String username    = body.get("username");
        String otp         = body.get("otp");
        String newPassword = body.get("newPassword");

        if (username == null || otp == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, OTP, and new password are required"));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        String key = username.trim().toLowerCase();
        OtpEntry entry = otpStore.get(key);
        if (entry == null || Instant.now().isAfter(entry.expiresAt()) || !entry.otp().equals(otp.trim())) {
            otpStore.remove(key);
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired OTP"));
        }
        otpStore.remove(key);

        Developer dev = repository.findByUsername(key).orElse(null);
        if (dev == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No account found with that username"));
        }

        dev.setPassword(newPassword);
        repository.save(dev);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}

*/
