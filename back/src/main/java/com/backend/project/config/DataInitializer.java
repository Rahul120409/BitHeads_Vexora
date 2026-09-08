package com.backend.project.config;

import com.backend.project.entity.*;
import com.backend.project.enums.*;
import com.backend.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SalonRepository salonRepository;
    private final StaffRepository staffRepository;
    private final SalonServiceRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueItemRepository queueItemRepository;
    private final PaymentRepository paymentRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Enable Supabase Realtime publication for queue and appointments
        try {
            jdbcTemplate.execute("ALTER PUBLICATION supabase_realtime ADD TABLE queue");
            log.info("Added queue table to supabase_realtime publication");
        } catch (Exception e) {
            log.debug("Realtime publication for queue already configured or skipped: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER PUBLICATION supabase_realtime ADD TABLE appointments");
            log.info("Added appointments table to supabase_realtime publication");
        } catch (Exception e) {
            log.debug("Realtime publication for appointments already configured or skipped: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE queue REPLICA IDENTITY FULL");
            jdbcTemplate.execute("ALTER TABLE appointments REPLICA IDENTITY FULL");
        } catch (Exception e) {
            log.debug("Replica identity setup skipped: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("UPDATE users SET user_type = role WHERE user_type IS NULL");
        } catch (Exception e) {
            log.debug("Update user_type skipped: {}", e.getMessage());
        }

        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial seeding.");
            return;
        }

        log.info("Starting database seeding for SalonPulse...");

        // 1. Create Salon
        Salon salon = salonRepository.save(Salon.builder()
                .name("SalonPulse Flagship")
                .address("101 MG Road")
                .city("Bangalore")
                .state("Karnataka")
                .phone("+91 98765 43210")
                .pincode("560001")
                .salonType("UNISEX")
                .email("flagship@salonpulse.com")
                .operatingTimings("09:00 AM - 09:00 PM")
                .status("ACTIVE")
                .build());

        String defaultEncodedPassword = passwordEncoder.encode("password123");

        // 2. Create Users
        User customer = userRepository.save(User.builder()
                .name("Rahul Sharma")
                .email("customer@demo.com")
                .password(defaultEncodedPassword)
                .role(Role.CUSTOMER)
                .userType("CUSTOMER")
                .build());

        User staffUser1 = userRepository.save(User.builder()
                .name("Alex Rivera")
                .email("staff@demo.com")
                .password(defaultEncodedPassword)
                .role(Role.STAFF)
                .userType("STAFF")
                .build());

        User staffUser2 = userRepository.save(User.builder()
                .name("Priya Patel")
                .email("priya@demo.com")
                .password(defaultEncodedPassword)
                .role(Role.STAFF)
                .userType("STAFF")
                .build());

        User adminUser = userRepository.save(User.builder()
                .name("Admin John")
                .email("admin@demo.com")
                .password(defaultEncodedPassword)
                .role(Role.ADMIN)
                .userType("ADMIN")
                .build());

        // 3. Create Staff
        Staff staff1 = staffRepository.save(Staff.builder()
                .salon(salon)
                .user(staffUser1)
                .name("Alex Rivera")
                .specialization("Master Stylist & Beard Specialist")
                .status(StaffStatus.AVAILABLE)
                .build());

        Staff staff2 = staffRepository.save(Staff.builder()
                .salon(salon)
                .user(staffUser2)
                .name("Priya Patel")
                .specialization("Colorist & Facial Expert")
                .status(StaffStatus.AVAILABLE)
                .build());

        // 4. Create Services
        SalonService haircut = serviceRepository.save(SalonService.builder()
                .salon(salon)
                .name("Classic Fade Haircut")
                .gender("MALE")
                .durationMinutes(30)
                .price(new BigDecimal("350.00"))
                .description("Clean skin fade or taper cut styled with premium pomade.")
                .imageUrl("https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500")
                .build());

        SalonService beardTrim = serviceRepository.save(SalonService.builder()
                .salon(salon)
                .name("Beard Trim & Sculpting")
                .gender("MALE")
                .durationMinutes(15)
                .price(new BigDecimal("200.00"))
                .description("Hot towel beard grooming, line-up, and nourishing oil treatment.")
                .imageUrl("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500")
                .build());

        SalonService hairColor = serviceRepository.save(SalonService.builder()
                .salon(salon)
                .name("Balayage & Hair Color")
                .gender("FEMALE")
                .durationMinutes(60)
                .price(new BigDecimal("1200.00"))
                .description("Hand-painted highlights for natural sun-kissed hair styling.")
                .imageUrl("https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500")
                .build());

        SalonService facial = serviceRepository.save(SalonService.builder()
                .salon(salon)
                .name("Revitalizing Glow Facial")
                .gender("UNISEX")
                .durationMinutes(45)
                .price(new BigDecimal("800.00"))
                .description("Deep pore cleansing, exfoliation, and hydration mask.")
                .imageUrl("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500")
                .build());

        // 5. Seed initial demo appointment and queue item for Customer
        Appointment appt = appointmentRepository.save(Appointment.builder()
                .customer(customer)
                .customerName(customer.getName())
                .staff(staff1)
                .service(haircut)
                .appointmentTime(LocalDateTime.now().plusMinutes(15))
                .status(AppointmentStatus.CONFIRMED)
                .build());

        queueItemRepository.save(QueueItem.builder()
                .appointment(appt)
                .position(1)
                .estimatedWaitMinutes(15)
                .status(QueueStatus.WAITING)
                .build());

        paymentRepository.save(Payment.builder()
                .appointment(appt)
                .amount(haircut.getPrice())
                .status(PaymentStatus.PENDING)
                .transactionRef("TXN-" + System.currentTimeMillis())
                .build());

        log.info("SalonPulse database seeded successfully!");
    }
}
