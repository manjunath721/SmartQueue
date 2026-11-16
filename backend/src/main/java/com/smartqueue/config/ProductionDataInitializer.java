
package com.smartqueue.config;

import com.smartqueue.entity.Role;
import com.smartqueue.entity.User;
import com.smartqueue.entity.ServiceEntity;
import com.smartqueue.enums.RoleType;
import com.smartqueue.repository.RoleRepository;
import com.smartqueue.repository.UserRepository;
import com.smartqueue.repository.ServiceRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Component
@Profile("prod")
public class ProductionDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${INITIAL_ADMIN_USERNAME}")
    private String adminUsername;

    @Value("${INITIAL_ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${INITIAL_ADMIN_PASSWORD}")
    private String adminPassword;

    @Value("${INITIAL_ADMIN_FULL_NAME}")
    private String adminFullName;

    @Value("${INITIAL_ADMIN_PHONE:}")
    private String adminPhone;

    public ProductionDataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            ServiceRepository serviceRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {

        if (adminPassword == null || adminPassword.length() < 12) {
            throw new IllegalStateException(
                "Initial administrator password must be at least 12 characters"
            );
        }

        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(
                    new Role(RoleType.ROLE_ADMIN,
                    "Administrator with full access")
                ));

        roleRepository.findByName(RoleType.ROLE_STAFF)
                .orElseGet(() -> roleRepository.save(
                    new Role(RoleType.ROLE_STAFF,
                    "Staff member who can manage queues")
                ));

        createService("General Inquiries & Reception",
                "GEN", "A", 10);

        createService("Accounts & Billing Desk",
                "BILL", "B", 15);

        createService("Loan & Mortgage Advisory",
                "LOAN", "C", 25);

        createService("Technical Support & IT Services",
                "TECH", "D", 20);

        if (!userRepository.existsByUsername(adminUsername)) {

            User admin = new User(
                adminUsername,
                adminEmail,
                passwordEncoder.encode(adminPassword),
                adminFullName,
                adminPhone
            );

            admin.setRoles(Collections.singleton(adminRole));
            userRepository.save(admin);
        }
    }

    private void createService(
            String name, String code, String prefix, int duration) {

        serviceRepository.findByCode(code)
            .orElseGet(() -> serviceRepository.save(
                new ServiceEntity(
                    name,
                    code,
                    prefix,
                    "Customer service desk",
                    duration
                )
            ));
    }
}
