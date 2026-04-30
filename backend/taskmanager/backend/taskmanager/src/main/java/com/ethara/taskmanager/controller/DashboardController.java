package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.DashboardDTO;
import com.ethara.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(dashboardService.getDashboard(user.getUsername()));
    }
}