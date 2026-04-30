package com.ethara.taskmanager.dto;

import com.ethara.taskmanager.entity.Priority;
import com.ethara.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank
    private String title;
    private String description;
    private Priority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    @NotNull
    private Long projectId;
    private Long assigneeId;
}