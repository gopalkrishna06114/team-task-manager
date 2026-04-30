package com.ethara.taskmanager.service;

import com.ethara.taskmanager.dto.DashboardDTO;
import com.ethara.taskmanager.entity.*;
import com.ethara.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public DashboardDTO getDashboard(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Project> projects = projectRepository.findAllByUser(user);

        List<Task> allTasks = projects.stream()
                .flatMap(p -> taskRepository.findByProject(p).stream())
                .distinct()
                .collect(Collectors.toList());

        Map<String, Long> tasksByUser = allTasks.stream()
                .filter(t -> t.getAssignee() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignee().getName(), Collectors.counting()));

        long overdue = allTasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.DONE)
                .count();

        return DashboardDTO.builder()
                .totalTasks(allTasks.size())
                .todoCount(allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count())
                .inProgressCount(allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count())
                .doneCount(allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count())
                .overdueCount(overdue)
                .totalProjects(projects.size())
                .tasksByUser(tasksByUser)
                .build();
    }
}