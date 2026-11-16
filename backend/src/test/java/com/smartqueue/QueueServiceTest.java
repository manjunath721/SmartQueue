package com.smartqueue;

import com.smartqueue.dto.request.CreateTokenRequest;
import com.smartqueue.dto.response.CustomerTokenTrackingResponse;
import com.smartqueue.dto.response.TokenResponse;
import com.smartqueue.entity.Role;
import com.smartqueue.entity.ServiceEntity;
import com.smartqueue.entity.User;
import com.smartqueue.enums.RoleType;
import com.smartqueue.enums.TokenStatus;
import com.smartqueue.exception.QueueException;
import com.smartqueue.repository.RoleRepository;
import com.smartqueue.repository.ServiceRepository;
import com.smartqueue.repository.UserRepository;
import com.smartqueue.service.QueueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class QueueServiceTest {

    @Autowired
    private QueueService queueService;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private ServiceEntity testService;
    private User testStaff;

    @BeforeEach
    void setUp() {
        Role staffRole = roleRepository.findByName(RoleType.ROLE_STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_STAFF, "Staff")));

        testStaff = userRepository.findByUsername("test_staff_unit")
                .orElseGet(() -> {
                    User staff = new User("test_staff_unit", "test_unit@test.com", "pass123", "Test Staff", "1234567890");
                    staff.setRoles(Collections.singleton(staffRole));
                    return userRepository.save(staff);
                });

        testService = serviceRepository.findByCode("TESTSVC")
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(
                        "Test Service For Unit Tests",
                        "TESTSVC",
                        "T",
                        "Service for testing queue logic",
                        10
                )));
    }

    @Test
    @DisplayName("Should generate sequential tokens with correct format and unique tracking ID")
    void testGenerateTokenSequential() {
        CreateTokenRequest req1 = new CreateTokenRequest(testService.getId(), "Alice Wonder", "+15551112222", "alice@example.com");
        CreateTokenRequest req2 = new CreateTokenRequest(testService.getId(), "Bob Builder", "+15553334444", "bob@example.com");

        TokenResponse token1 = queueService.generateToken(req1);
        TokenResponse token2 = queueService.generateToken(req2);

        assertNotNull(token1);
        assertNotNull(token2);
        assertTrue(token1.getTokenNumber().startsWith("T-"));
        assertTrue(token2.getTokenNumber().startsWith("T-"));
        assertNotEquals(token1.getTokenNumber(), token2.getTokenNumber());
        assertNotEquals(token1.getTrackingId(), token2.getTrackingId());
        assertEquals(TokenStatus.WAITING, token1.getStatus());
        assertEquals(TokenStatus.WAITING, token2.getStatus());
        assertTrue(token2.getSequenceNumber() > token1.getSequenceNumber());
    }

    @Test
    @DisplayName("Should maintain FIFO queue ordering when calling next customer")
    void testCallNextFifoOrder() {
        CreateTokenRequest req1 = new CreateTokenRequest(testService.getId(), "Customer First", "+15550000001", "first@example.com");
        CreateTokenRequest req2 = new CreateTokenRequest(testService.getId(), "Customer Second", "+15550000002", "second@example.com");

        TokenResponse token1 = queueService.generateToken(req1);
        TokenResponse token2 = queueService.generateToken(req2);

        TokenResponse called = queueService.callNext(testService.getId(), testStaff.getId(), "Counter 1");

        assertNotNull(called);
        assertEquals(token1.getTokenNumber(), called.getTokenNumber(), "Earliest waiting token must be called first");
        assertEquals(TokenStatus.SERVING, called.getStatus());
        assertNotNull(called.getCalledAt());
    }

    @Test
    @DisplayName("Should calculate queue position and estimated wait time correctly")
    void testQueuePositionCalculation() {
        CreateTokenRequest req1 = new CreateTokenRequest(testService.getId(), "Person 1", "+15559990001", "p1@example.com");
        CreateTokenRequest req2 = new CreateTokenRequest(testService.getId(), "Person 2", "+15559990002", "p2@example.com");
        CreateTokenRequest req3 = new CreateTokenRequest(testService.getId(), "Person 3", "+15559990003", "p3@example.com");

        TokenResponse t1 = queueService.generateToken(req1);
        TokenResponse t2 = queueService.generateToken(req2);
        TokenResponse t3 = queueService.generateToken(req3);

        CustomerTokenTrackingResponse track3 = queueService.trackToken(t3.getTrackingId());

        assertNotNull(track3);
        assertEquals(TokenStatus.WAITING, track3.getStatus());
        // At least t1 and t2 are ahead of t3
        assertTrue(track3.getPeopleAhead() >= 2);
        assertTrue(track3.getEstimatedWaitMinutes() >= 30);
    }

    @Test
    @DisplayName("Should complete serving token and allow calling the next customer")
    void testCompleteService() {
        CreateTokenRequest req = new CreateTokenRequest(testService.getId(), "Person Complete", "+15558881111", "pc@example.com");
        TokenResponse generated = queueService.generateToken(req);

        TokenResponse called = queueService.callNext(testService.getId(), testStaff.getId(), "Counter 1");
        assertEquals(TokenStatus.SERVING, called.getStatus());

        TokenResponse completed = queueService.completeService(called.getId(), testStaff.getId());
        assertEquals(TokenStatus.COMPLETED, completed.getStatus());
        assertNotNull(completed.getCompletedAt());
    }

    @Test
    @DisplayName("Should cancel token and preserve token history")
    void testCancelToken() {
        CreateTokenRequest req = new CreateTokenRequest(testService.getId(), "Person Cancel", "+15557772222", "pcan@example.com");
        TokenResponse generated = queueService.generateToken(req);

        TokenResponse cancelled = queueService.cancelToken(generated.getId(), testStaff.getId(), "Customer requested cancellation");
        assertEquals(TokenStatus.CANCELLED, cancelled.getStatus());
        assertNotNull(cancelled.getCancelledAt());
        assertEquals("Customer requested cancellation", cancelled.getCancellationReason());
    }

    @Test
    @DisplayName("Should reject calling next customer if staff is already actively serving someone")
    void testPreventCallingNextWhileServing() {
        CreateTokenRequest req1 = new CreateTokenRequest(testService.getId(), "Client 1", "+15554443331", "c1@example.com");
        CreateTokenRequest req2 = new CreateTokenRequest(testService.getId(), "Client 2", "+15554443332", "c2@example.com");

        queueService.generateToken(req1);
        queueService.generateToken(req2);

        queueService.callNext(testService.getId(), testStaff.getId(), "Counter 1");

        assertThrows(QueueException.class, () -> {
            queueService.callNext(testService.getId(), testStaff.getId(), "Counter 1");
        });
    }
}
