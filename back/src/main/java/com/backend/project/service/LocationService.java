package com.backend.project.service;

import com.backend.project.dto.LocationDto;
import com.backend.project.entity.City;
import com.backend.project.entity.State;
import com.backend.project.repository.CityRepository;
import com.backend.project.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    @Transactional
    public LocationDto.StateResponse saveState(LocationDto.StateRequest request) {
        if (request.getStateCode() == null || request.getStateCode().isBlank()) {
            throw new RuntimeException("State code is required");
        }
        if (request.getStateName() == null || request.getStateName().isBlank()) {
            throw new RuntimeException("State name is required");
        }

        String normalizedCode = request.getStateCode().trim().toUpperCase();
        if (stateRepository.existsByStateCode(normalizedCode)) {
            throw new RuntimeException("State with code " + normalizedCode + " already exists");
        }

        State state = State.builder()
                .stateCode(normalizedCode)
                .stateName(request.getStateName().trim())
                .build();

        State saved = stateRepository.save(state);
        return mapToStateResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LocationDto.StateResponse> getAllStates() {
        return stateRepository.findAll().stream()
                .map(this::mapToStateResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LocationDto.CityResponse saveCity(LocationDto.CityRequest request) {
        if (request.getStateId() == null) {
            throw new RuntimeException("State ID is required to create a city");
        }
        if (request.getCityCode() == null || request.getCityCode().isBlank()) {
            throw new RuntimeException("City code is required");
        }
        if (request.getCityName() == null || request.getCityName().isBlank()) {
            throw new RuntimeException("City name is required");
        }

        State state = stateRepository.findById(request.getStateId())
                .orElseThrow(() -> new RuntimeException("State not found with id " + request.getStateId()));

        City city = City.builder()
                .cityCode(request.getCityCode().trim().toUpperCase())
                .cityName(request.getCityName().trim())
                .state(state)
                .build();

        City saved = cityRepository.save(city);
        return mapToCityResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LocationDto.CityResponse> getCities(Long stateId) {
        List<City> cities = (stateId != null)
                ? cityRepository.findByStateId(stateId)
                : cityRepository.findAll();

        return cities.stream()
                .map(this::mapToCityResponse)
                .collect(Collectors.toList());
    }

    private LocationDto.StateResponse mapToStateResponse(State state) {
        return LocationDto.StateResponse.builder()
                .id(state.getId())
                .stateCode(state.getStateCode())
                .stateName(state.getStateName())
                .build();
    }

    private LocationDto.CityResponse mapToCityResponse(City city) {
        return LocationDto.CityResponse.builder()
                .id(city.getId())
                .cityCode(city.getCityCode())
                .cityName(city.getCityName())
                .stateId(city.getState().getId())
                .stateCode(city.getState().getStateCode())
                .stateName(city.getState().getStateName())
                .build();
    }
}
