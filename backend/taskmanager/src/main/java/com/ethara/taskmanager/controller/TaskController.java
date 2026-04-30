package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.TaskRequest;
import com.ethara.taskmanager.entity.Task;
import com.ethara.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request,
                                           @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.createTask(request, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @RequestBody TaskRequest request,
                                           @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.updateTask(id, request, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails user) {
        taskService.deleteTask(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable Long projectId,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, user.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Task>> getMyTasks(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.getMyTasks(user.getUsername()));
    }
}