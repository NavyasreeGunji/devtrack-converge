package com.converge.config;

import com.converge.entity.Developer;
import com.converge.repository.DeveloperRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DeveloperRepository developerRepository;

    public DataInitializer(DeveloperRepository developerRepository) {
        this.developerRepository = developerRepository;
    }

    @Override
    public void run(String... args) {
        migrateEmailDomain("converge.com", "criskasecurity.com");

        if (developerRepository.count() > 0) return;

        List<Developer> developers = List.of(
            dev("Praneeth", "praneeth@criskasecurity.com", "Manager", "1,2", "praneeth"),
            dev("Anil Yerupala", "anil.y@criskasecurity.com", "Tech Lead", "1,2", "anil.y"),
            dev("Navya Sree Gunji", "navya.sree@criskasecurity.com", "Developer", "1", "navya.sree"),
            dev("Nagaraju Gunji", "nagaraju@criskasecurity.com", "Developer", "1", "nagaraju"),
            dev("Abdul Wahid Syed", "wahid@criskasecurity.com", "Developer", "1", "wahid"),
            dev("Adnan Yousof", "adnan@criskasecurity.com", "Developer", "1", "adnan"),
            dev("Abdul Shahid Syed", "shahid@criskasecurity.com", "Developer", "1", "shahid"),
            dev("Navya Gujjeti", "navya.g@criskasecurity.com", "Developer", "2", "navya.g"),
            dev("Raghavendra Aadesh", "raghavendra@criskasecurity.com", "Developer", "2", "raghavendra"),
            dev("Manideep Vennam", "manideep@criskasecurity.com", "Developer", "2", "manideep"),
            dev("Aadil Shaik", "aadil@criskasecurity.com", "Developer", "1", "aadil"),
            dev("Aakhil Shaik", "aakhil@criskasecurity.com", "Developer", "2", "aakhil"),
            dev("Mohan Meesala", "mohan@criskasecurity.com", "Developer", "2", "mohan"),
            dev("Nithin Pillalamari", "nithin@criskasecurity.com", "Developer", "2", "nithin"),
            dev("Anil Meesala", "anil.m@criskasecurity.com", "Developer", "2", "anil.m")
        );

        developerRepository.saveAll(developers);
        System.out.println("✓ Seeded " + developers.size() + " developers");
    }

    private void migrateEmailDomain(String oldDomain, String newDomain) {
        List<Developer> all = developerRepository.findAll();
        List<Developer> toUpdate = new ArrayList<>();
        for (Developer d : all) {
            if (d.getEmail() != null && d.getEmail().endsWith("@" + oldDomain)) {
                d.setEmail(d.getEmail().replace("@" + oldDomain, "@" + newDomain));
                toUpdate.add(d);
            }
        }
        if (!toUpdate.isEmpty()) {
            developerRepository.saveAll(toUpdate);
            System.out.println("✓ Migrated " + toUpdate.size() + " email(s) from @" + oldDomain + " → @" + newDomain);
        }
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
