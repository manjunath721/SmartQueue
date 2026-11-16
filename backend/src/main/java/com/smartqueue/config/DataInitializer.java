package com.smartqueue.config;

import org.springframework.context.annotation.Profile;
import com.smartqueue.dto.request.CreateTokenRequest;
import com.smartqueue.entity.*;
import com.smartqueue.enums.RoleType;
import com.smartqueue.enums.TokenStatus;
import com.smartqueue.repository.*;
import com.smartqueue.service.QueueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Profile("!prod")
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final StaffServiceAssignmentRepository assignmentRepository;
    private final QueueTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final QueueService queueService;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           ServiceRepository serviceRepository,
                           StaffServiceAssignmentRepository assignmentRepository,
                           QueueTokenRepository tokenRepository,
                           PasswordEncoder passwordEncoder,
                           QueueService queueService) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.assignmentRepository = assignmentRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.queueService = queueService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing Smart Queue default roles, users, and services...");

        // 1. Initialize Roles
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_ADMIN, "Administrator with full access")));

        Role staffRole = roleRepository.findByName(RoleType.ROLE_STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_STAFF, "Staff member who can manage queues")));

        // 2. Initialize Admin User
        User adminUser = userRepository.findByUsername("admin")
                .orElseGet(() -> {
                    User admin = new User(
                            "admin",
                            "admin@smartqueue.com",
                            passwordEncoder.encode("AdminPassword123!"),
                            "System Administrator",
                            "+1 (555) 019-2831"
                    );
                    admin.setRoles(new HashSet<>(List.of(adminRole, staffRole)));
                    return userRepository.save(admin);
                });

        // 3. Initialize Staff Users
        User staffSarah = userRepository.findByUsername("staff_sarah")
                .orElseGet(() -> {
                    User staff = new User(
                            "staff_sarah",
                            "sarah@smartqueue.com",
                            passwordEncoder.encode("StaffPassword123!"),
                            "Sarah Jenkins",
                            "+1 (555) 014-9982"
                    );
                    staff.setRoles(Collections.singleton(staffRole));
                    return userRepository.save(staff);
                });

        User staffDavid = userRepository.findByUsername("staff_david")
                .orElseGet(() -> {
                    User staff = new User(
                            "staff_david",
                            "david@smartqueue.com",
                            passwordEncoder.encode("StaffPassword123!"),
                            "David Miller",
                            "+1 (555) 018-7741"
                    );
                    staff.setRoles(Collections.singleton(staffRole));
                    return userRepository.save(staff);
                });

        // 4. Initialize Services
        ServiceEntity generalService = serviceRepository.findByCode("GEN")
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(
                        "General Inquiries & Reception",
                        "GEN",
                        "A",
                        "General questions, token inquiries, appointment confirmations and visitor assistance.",
                        10
                )));

        ServiceEntity billingService = serviceRepository.findByCode("BILL")
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(
                        "Accounts & Billing Desk",
                        "BILL",
                        "B",
                        "Invoicing, invoice settlements, refunds, payment processing and billing queries.",
                        15
                )));

        ServiceEntity loanService = serviceRepository.findByCode("LOAN")
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(
                        "Loan & Mortgage Advisory",
                        "LOAN",
                        "C",
                        "Personal loans, mortgages, refinancing consultations and credit assessments.",
                        25
                )));

        ServiceEntity techService = serviceRepository.findByCode("TECH")
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(
                        "Technical Support & IT Services",
                        "TECH",
                        "D",
                        "Hardware returns, technical diagnosis, device setup and troubleshooting.",
                        20
                )));

        // 5. Staff Service Assignments
        if (assignmentRepository.findByUserIdAndServiceId(staffSarah.getId(), generalService.getId()).isEmpty()) {
            assignmentRepository.save(new StaffServiceAssignment(staffSarah, generalService, "Counter 1"));
        }
        if (assignmentRepository.findByUserIdAndServiceId(staffSarah.getId(), billingService.getId()).isEmpty()) {
            assignmentRepository.save(new StaffServiceAssignment(staffSarah, billingService, "Counter 1"));
        }
        if (assignmentRepository.findByUserIdAndServiceId(staffDavid.getId(), loanService.getId()).isEmpty()) {
            assignmentRepository.save(new StaffServiceAssignment(staffDavid, loanService, "Desk 2"));
        }
        if (assignmentRepository.findByUserIdAndServiceId(staffDavid.getId(), techService.getId()).isEmpty()) {
            assignmentRepository.save(new StaffServiceAssignment(staffDavid, techService, "Desk 2"));
        }

        // 6. Seed initial realistic tokens if queue is empty
        if (tokenRepository.count() == 0) {
            logger.info("Generating initial demo queue tokens...");

            // Create tokens for General Inquiries
            queueService.generateToken(new CreateTokenRequest(generalService.getId(), "Emma Watson", "+1 (555) 111-2233", "emma@example.com"));
            queueService.generateToken(new CreateTokenRequest(generalService.getId(), "James Anderson", "+1 (555) 222-3344", "james@example.com"));
            queueService.generateToken(new CreateTokenRequest(generalService.getId(), "Olivia Harris", "+1 (555) 333-4455", "olivia@example.com"));

            // Create tokens for Billing
            queueService.generateToken(new CreateTokenRequest(billingService.getId(), "Michael Scott", "+1 (555) 444-5566", "michael@example.com"));
            queueService.generateToken(new CreateTokenRequest(billingService.getId(), "Pam Beesly", "+1 (555) 555-6677", "pam@example.com"));

            // Create tokens for Loan
            queueService.generateToken(new CreateTokenRequest(loanService.getId(), "Robert Thorne", "+1 (555) 666-7788", "robert@example.com"));

            // Call one token so there is an active SERVING customer right away
            try {
                queueService.callNext(generalService.getId(), staffSarah.getId(), "Counter 1");
            } catch (Exception e) {
                logger.warn("Could not pre-call token: {}", e.getMessage());
            }
        }

        logger.info("Smart Queue initialization complete!");
    }
}
