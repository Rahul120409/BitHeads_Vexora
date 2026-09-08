package com.backend.project.repository;

import com.backend.project.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    Optional<State> findByStateCode(String stateCode);
    boolean existsByStateCode(String stateCode);
}
