# 💈 SalonPulse — Smart Salon Queue, Booking & Operations Platform

SalonPulse is an end-to-end salon management and real-time smart queuing system designed to eliminate wait-time uncertainty for customers and streamline operations for salon staff and administrators.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Core Features & Modules](#-core-features--modules)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide (Step-by-Step)](#-quick-start-guide-step-by-step)
  - [1. Backend Setup (Spring Boot)](#1-backend-setup-spring-boot)
  - [2. Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
- [🔑 Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [🌐 Application Routes & Endpoints](#-application-routes--endpoints)
- [⚡ Real-Time Queuing Mechanics](#-real-time-queuing-mechanics)
- [🛠️ Troubleshooting & FAQs](#️-troubleshooting--faqs)

---

## 🌟 Overview

Traditional salon walk-ins and static bookings suffer from unexpected delays, crowded waiting areas, and lack of visibility into stylist availability. **SalonPulse** bridges this gap:

- **Customers** can browse haircut catalogs, inspect real-time queues and wait times *before* booking, select preferred stylists, reserve tokens, and track their position live.
- **Stylists & Front-Desk Staff** have access to a digital queue board with instant service tracking (`SERVING`, `COMPLETED`, `NO_SHOW`), duty status management (`AVAILABLE`, `BREAK`, `BUSY`), and rapid walk-in registration.
- **Admins** manage multiple salon branches, states, cities, service catalogs, staff assignments, and track operational KPIs and revenue.

---

## 🏗️ System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                   SalonPulse Web UI                    │
   │        (Next.js 16 • React 19 • Tailwind CSS 4)        │
   └───────────────┬────────────────────────┬───────────────┘
                   │ HTTP / REST            │ Realtime Subscriptions
                   ▼                        ▼
   ┌────────────────────────────────┐  ┌────────────────────┐
   │      Spring Boot Backend       │  │  Supabase Realtime │
   │ (Java 17 • Spring MVC • JPA)   │  │  (WebSockets)      │
   └───────────────┬────────────────┘  └─────────┬──────────┘
                   │ HikariCP (Port 6543)        │
                   ▼                             │
   ┌─────────────────────────────────────────────▼──────────┐
   │              Supabase PostgreSQL Database              │
   └────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Realtime**: `@supabase/supabase-js` for live table updates

### Backend
- **Framework**: [Spring Boot 4.x](https://spring.io/projects/spring-boot)
- **Language**: Java 17+
- **Persistence**: Spring Data JPA / Hibernate
- **Security**: Spring Security & BCrypt Password Encoding
- **Database Connection**: HikariCP connection pool with transaction pooling
- **Build Tool**: Apache Maven (wrapper included: `mvnw` / `mvnw.cmd`)

### Database & Cloud
- **Database**: PostgreSQL hosted on [Supabase](https://supabase.com/)
- **Real-Time Engine**: PostgreSQL WAL replication via `supabase_realtime` publication

---

## 🚀 Core Features & Modules

### 1. 🧑‍🦱 Customer Portal
- **Service Catalog**: Browse styles/treatments categorized by gender with pricing, duration, and imagery.
- **Smart Booking**: Select salon branch, service, stylist, and see the next available token before committing.
- **Live Queue Tracker**: Real-time token number, position in line, estimated wait time in minutes, and assigned stylist.
- **Appointment Management**: View upcoming/past bookings and cancel or reschedule appointments on demand.

### 2. ✂️ Stylist & Queue Desk Operations
- **Live Queue Counter**: Displays currently serving customer and FIFO waiting list.
- **One-Click Progression**:
  - `Start Service`: Marks queue entry as `SERVING` and updates stylist status to `BUSY`.
  - `Complete Service`: Auto-marks appointment as `COMPLETED`, frees the stylist, and dynamically recalculates wait times for all subsequent customers.
  - `Mark No-Show`: Handles customer absences cleanly without disrupting queue sequence.
- **Walk-In Counter**: Instantly assigns tokens to offline walk-in visitors into the live queue.
- **Duty Status Toggle**: Switch between `AVAILABLE`, `BREAK`, `BUSY`, and `OFFLINE`.

### 3. 📊 Admin & Management Console
- **Executive Dashboard**: Daily bookings, revenue counter, active queue count, staff utilization, and cancellation rates.
- **Multi-Location Hierarchy**: Manage States, Cities, and Salon Branches.
- **Staff Roster**: Add/edit stylists, assign to salon branches, and manage specialties.
- **Payment & Refunds**: Mock transaction lifecycle with unique transaction references.

---

## 📁 Project Directory Structure

```text
st_john/
├── back/                             # Spring Boot Backend Project
│   ├── mvnw / mvnw.cmd               # Maven wrappers
│   ├── pom.xml                       # Maven dependencies & plugins
│   └── src/main/
│       ├── java/com/backend/project/
│       │   ├── config/               # Security & DataInitializer (auto-seeder)
│       │   ├── controller/           # REST Controllers (Auth, Queue, Staff, etc.)
│       │   ├── dto/                  # Data Transfer Objects / Request & Response
│       │   ├── entity/               # JPA Entities (User, Salon, Queue, Appointment)
│       │   ├── enums/                # Role, QueueStatus, DutyStatus, SalonType
│       │   ├── repository/           # Spring Data JPA Repositories
│       │   ├── security/             # Custom security configurations
│       │   └── service/              # Core business & queue calculation services
│       └── resources/
│           └── application.properties# Database & server configuration (Port 8085)
│
├── front/                            # Next.js Frontend Application
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Admin Dashboard & Management views
│   │   ├── customer/                 # Customer Home, Booking, Queue, Profile
│   │   ├── login/                    # Authentication (Login)
│   │   ├── register/                 # User Registration
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing / Home Page
│   ├── components/                   # Reusable UI widgets
│   ├── services/                     # Backend API & location services
│   ├── mock/                         # Fallback mock data
│   ├── .env                          # Frontend environment variables
│   └── package.json                  # Next.js dependencies & scripts
│
├── API_DOCUMENTATION.md              # Complete REST API specification & curl examples
└── README.md                         # Project documentation & execution guide
```

---

## 💻 Prerequisites

Before running the application, make sure you have the following installed on your machine:

1. **Java JDK 17 or higher** (JDK 17 or JDK 21 recommended)
   - Verify: `java -version`
2. **Node.js 18+ or 20+** and **npm**
   - Verify: `node -v` and `npm -v`
3. **Git** (optional, for version control)
4. **Internet Access**: Required for connecting to the pre-configured Supabase PostgreSQL cloud instance.

---

## 🏁 Quick Start Guide (Step-by-Step)

### 1. Backend Setup (Spring Boot)

The backend is configured to run on port **`8085`** and connects to a managed Supabase PostgreSQL database. The application includes a `DataInitializer` that automatically sets up database tables and seeds demo accounts on the very first boot.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd back
   ```

2. *(Optional)* Verify `src/main/resources/application.properties`:
   - Pre-configured to Supabase pooler on port `6543`.
   - `server.port=8085`

3. Run the Spring Boot application:

   - **Windows (Command Prompt / PowerShell)**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
     *(Or if you have Maven installed globally: `mvn spring-boot:run`)*

   - **macOS / Linux**:
     ```bash
     chmod +x ./mvnw
     ./mvnw spring-boot:run
     ```

4. Once the console logs display:
   ```text
   Started ProjectApplication in X.XXX seconds
   ```
   The backend is active and listening at **`http://localhost:8085`**.

---

### 2. Frontend Setup (Next.js)

The frontend runs on port **`3000`** and communicates with the backend API at `http://localhost:8085`.

1. Open a **new** terminal window and navigate to the `front` directory:
   ```bash
   cd front
   ```

2. Verify or update `.env` in the `front/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8085
   NEXT_PUBLIC_SUPABASE_URL=https://gefkbyupvmxrinilvauh.supabase.co
   ```

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Access the application in your browser:
   👉 **`http://localhost:3000`**

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-seeded with accounts ready for instant testing:

| Role | Email | Password | Default Persona / Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `password123` | Pre-booked appointment with token #1 in queue |
| **Staff 1** | `staff@demo.com` | `password123` | *Alex Rivera* — Master Stylist & Beard Specialist (`staffId: 1`) |
| **Staff 2** | `priya@demo.com` | `password123` | *Priya Patel* — Colorist & Facial Expert (`staffId: 2`) |
| **Admin** | `admin@demo.com` | `password123` | Salon Operations Admin — Multi-branch KPIs & Management |

---

## 🌐 Application Routes & Endpoints

### Key Frontend Routes
- **Landing Page**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login`
- **Register**: `http://localhost:3000/register`
- **Customer Dashboard**: `http://localhost:3000/customer`
- **Book Appointment**: `http://localhost:3000/customer/book`
- **Live Queue View**: `http://localhost:3000/customer/queue`
- **My Appointments**: `http://localhost:3000/customer/appointments`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Salon Management**: `http://localhost:3000/admin/salons`
- **Locations (States/Cities)**: `http://localhost:3000/admin/locations`

### Key Backend REST Endpoints
For detailed request/response schemas, refer to the [API Documentation](file:///d:/st_john/API_DOCUMENTATION.md).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return token |
| `POST` | `/api/auth/register` | Register new customer or staff |
| `GET` | `/api/haircut-styles` | Fetch available salon haircut styles & services |
| `GET` | `/api/queue/ongoing` | Get summary of current serving customer & live queue |
| `GET` | `/api/queue/customer/{id}` | Get real-time queue position for a specific customer |
| `POST` | `/api/queue/walk-in` | Register walk-in customer at the counter |
| `PUT` | `/api/queue/{id}/start` | Mark queue token as `SERVING` |
| `PUT` | `/api/queue/{id}/complete` | Mark queue token as `COMPLETED` and update positions |
| `PUT` | `/api/queue/{id}/no-show` | Mark queue token as `NO_SHOW` |
| `POST` | `/api/appointments` | Book a new appointment & generate queue token |
| `GET` | `/api/admin/dashboard` | Fetch executive KPIs, revenue, and queue stats |

---

## ⚡ Real-Time Queuing Mechanics

1. **Token Generation**: Each confirmed appointment generates a sequential daily token (e.g., `T-001`, `T-002`).
2. **Dynamic Wait Times**:
   - `estimatedWaitMinutes` is calculated dynamically based on the cumulative service duration of preceding waiting customers.
3. **Queue Shifts**:
   - Completing or cancelling a service immediately decrements queue positions for all subsequent waiting appointments.
4. **Instant Updates**:
   - Frontend components use Supabase Realtime subscriptions to listen to `postgres_changes` on the `queue` table, triggering instant re-renders without polling.

---

## 🛠️ Troubleshooting & FAQs

### Q1: The backend fails to start with a Port 8085 conflict
- **Solution**: Check if another process is using port `8085`.
  - On Windows:
    ```powershell
    netstat -ano | findstr :8085
    taskkill /PID <PID> /F
    ```
  - Alternatively, change `server.port=8086` in `back/src/main/resources/application.properties` and update `NEXT_PUBLIC_API_URL` in `front/.env`.

### Q2: Database connection timeout during Maven startup
- **Solution**: The backend connects to Supabase via transaction pooling (`aws-0-ap-south-1.pooler.supabase.com:6543`). Verify your internet connectivity or firewall rules permitting outbound PostgreSQL connections on port `6543`.

### Q3: Frontend shows network errors when calling APIs
- **Solution**:
  1. Ensure the Spring Boot backend is actively running on port `8085`.
  2. Verify that `NEXT_PUBLIC_API_URL=http://localhost:8085` in `front/.env`.
  3. CORS is enabled for `http://localhost:3000` in backend security config.

---

## 👥 Contributors & Hackathon Team

- **SalonPulse Team** — Built for the SalonPulse Smart Operations Hackathon.
