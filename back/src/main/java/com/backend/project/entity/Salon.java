package com.backend.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Salon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String city;

    private String state;

    private String phone;

    private String pincode;

    @Column(name = "salon_type")
    private String salonType;

    private String email;

    @Column(name = "operating_timings")
    private String operatingTimings;

    @Builder.Default
    private String status = "ACTIVE";
}
