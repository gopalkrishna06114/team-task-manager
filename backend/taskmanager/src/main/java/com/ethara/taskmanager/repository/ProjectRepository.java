package com.ethara.taskmanager.repository;

import com.ethara.taskmanager.entity.Project;
import com.ethara.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User user);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m = :user")
    List<Project> findByMember(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.createdBy = :user OR m = :user")
    List<Project> findAllByUser(@Param("user") User user);
}