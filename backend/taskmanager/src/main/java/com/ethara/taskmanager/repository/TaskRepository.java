package com.ethara.taskmanager.repository;

import com.ethara.taskmanager.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User user);
    List<Task> findByStatus(TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project = :project AND t.assignee = :user")
    List<Task> findByProjectAndAssignee(Project project, User user);
}