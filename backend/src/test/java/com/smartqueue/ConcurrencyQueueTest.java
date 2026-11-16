package com.smartqueue;

import com.smartqueue.dto.request.CreateTokenRequest;
import com.smartqueue.dto.response.TokenResponse;
import com.smartqueue.entity.ServiceEntity;
import com.smartqueue.repository.ServiceRepository;
import com.smartqueue.service.QueueService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ConcurrencyQueueTest {

    @Autowired
    private QueueService queueService;

    @Autowired
    private ServiceRepository serviceRepository;

    @Test
    @DisplayName("Should handle simultaneous customer registrations without duplicate tokens")
    void testConcurrentCustomerRegistrations() throws InterruptedException {
        ServiceEntity service = serviceRepository.findByCode("CONCUR")
                .orElseGet(() -> serviceRepository.save(new ServiceEntity(
                        "Concurrency Test Service",
                        "CONCUR",
                        "CQT",
                        "Service testing multithreaded queue",
                        15
                )));

        // Pre-initialize initial token to establish counter
        queueService.generateToken(new CreateTokenRequest(
                service.getId(), "Initial Customer", "+15550000000", "init@test.com"));

        int numberOfThreads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);

        Set<String> generatedTokens = Collections.synchronizedSet(new HashSet<>());
        Set<Integer> generatedSequences = Collections.synchronizedSet(new HashSet<>());

        for (int i = 0; i < numberOfThreads; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    CreateTokenRequest request = new CreateTokenRequest(
                            service.getId(),
                            "Concurrent User " + index,
                            "+1555" + String.format("%07d", index + 10),
                            "user" + index + "@test.com"
                    );
                    TokenResponse token = queueService.generateToken(request);
                    if (token != null) {
                        generatedTokens.add(token.getTokenNumber());
                        generatedSequences.add(token.getSequenceNumber());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean completed = latch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "All registration threads must complete within timeout");
        assertEquals(numberOfThreads, generatedTokens.size(), "Each concurrent registration must yield a unique token number");
        assertEquals(numberOfThreads, generatedSequences.size(), "Each sequence number must be unique");
    }
}
