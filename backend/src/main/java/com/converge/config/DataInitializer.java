package com.converge.config;

import com.converge.entity.Developer;
import com.converge.repository.DeveloperRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DeveloperRepository developerRepository;

    public DataInitializer(DeveloperRepository developerRepository) {
        this.developerRepository = developerRepository;
    }

    @Override
    public void run(String... args) {
        if (developerRepository.count() > 0) return;

        List<Developer> developers = List.of(
            dev("Praneeth", "praneeth@converge.com", "Manager", "1,2", "praneeth"),
            dev("Anil Yerupala", "anil.y@converge.com", "Tech Lead", "1,2", "anil.y"),
            dev("Navya Sree Gunji", "navya.sree@converge.com", "Developer", "1", "navya.sree"),
            dev("Nagaraju Gunji", "nagaraju@converge.com", "Developer", "1", "nagaraju"),
            dev("Abdul Wahid Syed", "wahid@converge.com", "Developer", "1", "wahid"),
            dev("Adnan Yousof", "adnan@converge.com", "Developer", "1", "adnan"),
            dev("Abdul Shahid Syed", "shahid@converge.com", "Developer", "1", "shahid"),
            dev("Navya Gujjeti", "navya.g@converge.com", "Developer", "2", "navya.g"),
            dev("Raghavendra Aadesh", "raghavendra@converge.com", "Developer", "2", "raghavendra"),
            dev("Manideep Vennam", "manideep@converge.com", "Developer", "2", "manideep"),
            dev("Aadil Shaik", "aadil@converge.com", "Developer", "1", "aadil"),
            dev("Aakhil Shaik", "aakhil@converge.com", "Developer", "2", "aakhil"),
            dev("Mohan Meesala", "mohan@converge.com", "Developer", "2", "mohan"),
            dev("Nithin Pillalamari", "nithin@converge.com", "Developer", "2", "nithin"),
            dev("Anil Meesala", "anil.m@converge.com", "Developer", "2", "anil.m")
        );

        developerRepository.saveAll(developers);
        System.out.println("✓ Seeded " + developers.size() + " developers");
    }

    private Developer dev(String name, String email, String role, String teamIds, String username) {
        Developer d = new Developer();
        d.setName(name);
        d.setEmail(email);
        d.setRole(role);
        d.setTeamIds(teamIds);
        d.setUsername(username);
        d.setPassword("Converge@2026");
        return d;
    }
}
