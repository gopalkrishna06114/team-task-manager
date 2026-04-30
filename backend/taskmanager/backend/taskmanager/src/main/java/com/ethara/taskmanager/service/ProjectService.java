package com.ethara.taskmanager.service;

import com.ethara.taskmanager.dto.ProjectRequest;
import com.ethara.taskmanager.entity.*;
import com.ethara.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Project createProject(ProjectRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();

        // Set role to ADMIN
        user.setRole(Role.ADMIN);
        User savedUser = userRepository.save(user);

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(savedUser)
                .build();

        project.getMembers().add(savedUser);  // add creator as first member
        return projectRepository.save(project);
    }

    public List<Project> getUserProjects(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return projectRepository.findAllByUser(user);
    }

    public Project getProject(Long id, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByEmail(email).orElseThrow();
        boolean isMember = project.getMembers().contains(user) || project.getCreatedBy().equals(user);
        if (!isMember) throw new AccessDeniedException("Not a member of this project");
        return project;
    }

    public Project addMember(Long projectId, Long userId, String adminEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        if (!project.getCreatedBy().equals(admin))
            throw new AccessDeniedException("Only project admin can add members");
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        project.getMembers().add(member);
        return projectRepository.save(project);
    }

    public Project removeMember(Long projectId, Long userId, String adminEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        if (!project.getCreatedBy().equals(admin))
            throw new AccessDeniedException("Only project admin can remove members");
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        project.getMembers().remove(member);
        return projectRepository.save(project);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}