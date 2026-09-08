package com.backend.project.controller;

import com.backend.project.dto.QueueDto;
import com.backend.project.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QueueController {

    private final QueueService queueService;

    @GetMapping
    public ResponseEntity<List<QueueDto.QueueResponse>> getLiveQueue() {
        return ResponseEntity.ok(queueService.getLiveQueue());
    }

    @GetMapping("/ongoing")
    public ResponseEntity<QueueDto.QueueSummaryResponse> getOngoingQueue() {
        return ResponseEntity.ok(queueService.getQueueSummary());
    }

    @GetMapping("/summary")
    public ResponseEntity<QueueDto.QueueSummaryResponse> getQueueSummary() {
        return ResponseEntity.ok(queueService.getQueueSummary());
    }

    @GetMapping("/next-available")
    public ResponseEntity<QueueDto.QueueSummaryResponse> getNextAvailable() {
        return ResponseEntity.ok(queueService.getQueueSummary());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerQueueStatus(@PathVariable Long customerId) {
        QueueDto.QueueResponse response = queueService.getCustomerQueueStatus(customerId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/walk-in")
    public ResponseEntity<?> addWalkIn(@RequestBody QueueDto.WalkInRequest request) {
        try {
            return ResponseEntity.ok(queueService.addWalkIn(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startService(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(queueService.startService(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeService(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(queueService.completeService(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/no-show")
    public ResponseEntity<?> noShowService(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(queueService.noShowService(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelQueueItem(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(queueService.cancelQueueItem(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
