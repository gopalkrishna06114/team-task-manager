package com.ethara.taskmanager.service;

import com.ethara.taskmanager.dto.TaskRequest;
import com.ethara.taskmanager.entity.*;
import com.ethara.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Task createTask(TaskRequest request, String email) {
        User creator = userRepository.findByEmail(email).orElseThrow();
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getCreatedBy().equals(creator))
            throw new AccessDeniedException("Only admin can create tasks");

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .project(project)
                .createdBy(creator)
                .build();

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElseThrow();
            task.setAssignee(assignee);
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long taskId, TaskRequest request, String email) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findByEmail(email).orElseThrow();
        boolean isAdmin = task.getProject().getCreatedBy().equals(user);
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().equals(user);

        if (!isAdmin && !isAssignee)
            throw new AccessDeniedException("Not authorized to update this task");

        if (isAdmin) {
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            task.setPriority(request.getPriority());
            task.setDueDate(request.getDueDate());
            if (request.getAssigneeId() != null) {
                User assignee = userRepository.findById(request.getAssigneeId()).orElseThrow();
                task.setAssignee(assignee);
            }
        }
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        return taskRepository.save(task);
    }

    public void deleteTask(Long taskId, String email) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!task.getProject().getCreatedBy().equals(user))
            throw new AccessDeniedException("Only admin can delete tasks");
        taskRepository.delete(task);
    }

    public List<Task> getProjectTasks(Long projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByEmail(email).orElseThrow();
        boolean isAdmin = project.getCreatedBy().equals(user);
        if (isAdmin) return taskRepository.findByProject(project);
        return taskRepository.findByProjectAndAssignee(project, user);
    }

    public List<Task> getMyTasks(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return taskRepository.findByAssignee(user);
    }
}