package com.ethara.taskmanager.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class DashboardDTO {
    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long doneCount;
    private long overdueCount;
    private long totalProjects;
    private Map<String, Long> tasksByUser;
}