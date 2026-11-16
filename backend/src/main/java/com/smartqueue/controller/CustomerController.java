package com.smartqueue.controller;

import com.smartqueue.dto.request.CreateTokenRequest;
import com.smartqueue.dto.response.CustomerTokenTrackingResponse;
import com.smartqueue.dto.response.QueueDisplayResponse;
import com.smartqueue.dto.response.TokenResponse;
import com.smartqueue.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final QueueService queueService;

    public CustomerController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping("/tokens")
    public ResponseEntity<TokenResponse> generateToken(@Valid @RequestBody CreateTokenRequest request) {
        TokenResponse response = queueService.generateToken(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/tokens/{trackingId}")
    public ResponseEntity<CustomerTokenTrackingResponse> trackToken(@PathVariable String trackingId) {
        CustomerTokenTrackingResponse response = queueService.trackToken(trackingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tokens/{trackingId}/position")
    public ResponseEntity<CustomerTokenTrackingResponse> getTokenPosition(@PathVariable String trackingId) {
        CustomerTokenTrackingResponse response = queueService.trackToken(trackingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/display-board")
    public ResponseEntity<List<QueueDisplayResponse>> getDisplayBoard() {
        return ResponseEntity.ok(queueService.getQueueDisplayBoard());
    }
}
