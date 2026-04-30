package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.ProjectRequest;
import com.ethara.taskmanager.entity.*;
import com.ethara.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectRequest request,
                                                 @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.createProject(request, user.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.getUserProjects(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.getProject(id, user.getUsername()));
    }

    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<Project> addMember(@PathVariable Long id, @PathVariable Long userId,
                                             @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.addMember(id, userId, user.getUsername()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Project> removeMember(@PathVariable Long id, @PathVariable Long userId,
                                                @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, user.getUsername()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(projectService.getAllUsers());
    }
}