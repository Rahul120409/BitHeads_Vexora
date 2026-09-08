# SalonPulse Backend API & Integration Guide (Person 4 Handoff)

This document provides the complete API contracts, demo credentials, and real-time subscription snippets for **Person 1 (Customer)**, **Person 2 (Staff)**, and **Person 3 (Admin)**.

**Backend Base URL**: `http://localhost:8085`  
**CORS**: Configured to permit `http://localhost:3000` with all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`).

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `password123` | Pre-booked appointment & queue position #1 |
| **Staff 1** | `staff@demo.com` | `password123` | *Alex Rivera* (`staffId: 1`) |
| **Staff 2** | `priya@demo.com` | `password123` | *Priya Patel* (`staffId: 2`) |
| **Admin** | `admin@demo.com` | `password123` | Salon Operations Admin |

---

## 🧑‍💼 Module 1: Customer & Auth (For Person 1)

### 1. User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "customer@demo.com",
    "password": "password123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "customer@demo.com",
    "role": "CUSTOMER",
    "userType": "CUSTOMER",
    "staffId": null,
    "token": "mock-jwt-token-1"
  }
  ```

### 2. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "CUSTOMER",
    "userType": "CUSTOMER"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "userType": "CUSTOMER",
    "staffId": null,
    "token": "mock-jwt-token-5"
  }
  ```

### 3. Save Haircut Style / Service
- **Endpoint**: `POST /api/haircut-styles` *(or `POST /api/services`)*
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Classic Fade Haircut",
    "gender": "MALE",
    "price": 350.00,
    "duration": 30,
    "description": "Clean skin fade or taper cut styled with premium pomade.",
    "picture": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500"
  }
  ```
  *(Notes: Both `picture` / `imageUrl` and `duration` / `durationMinutes` are accepted).*
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "salonId": 1,
    "name": "Classic Fade Haircut",
    "gender": "MALE",
    "price": 350.00,
    "durationMinutes": 30,
    "description": "Clean skin fade or taper cut styled with premium pomade.",
    "imageUrl": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500"
  }
  ```

### 4. Fetch Haircut Styles / Services
- **Fetch All**: `GET /api/haircut-styles` *(or `GET /api/services`)*
- **Fetch for Selected Salon**: 
  - `GET /api/haircut-styles/salon/{salonId}` *(Recommended)*
  - OR `GET /api/haircut-styles?salonId={salonId}`
  - *(Also aliased at `GET /api/services/salon/{salonId}` and `GET /api/services?salonId={salonId}`)*
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "salonId": 1,
      "name": "Classic Fade Haircut",
      "gender": "MALE",
      "price": 350.00,
      "durationMinutes": 30,
      "description": "Clean skin fade or taper cut styled with premium pomade.",
      "imageUrl": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500"
    }
  ]
  ```

### 5. Fetch Haircut Style by ID
- **Endpoint**: `GET /api/haircut-styles/{id}` *(or `GET /api/services/{id}`)*

### 6. Update Haircut Style
- **Endpoint**: `PUT /api/haircut-styles/{id}` *(or `PUT /api/services/{id}`)*
- **Request Body**: Same format as creation.

---

### 3. View Live Queue & Next Available Token (Before Booking)
- **Endpoint**: `GET /api/queue/next-available` *(or `GET /api/queue/ongoing`)*
- **Description**: Allows the customer to see who is currently being served, how many are waiting, and the exact next available token & wait time before making a booking.
- **Response** (`200 OK`):
  ```json
  {
    "ongoingToken": "T-001",
    "ongoingCustomerName": "Rahul Sharma",
    "ongoingStylistName": "Alex Rivera",
    "totalServing": 1,
    "totalWaiting": 2,
    "estimatedWaitMinutes": 35,
    "nextAvailableToken": "T-003",
    "nextQueuePosition": 3,
    "estimatedWaitMinutesForNext": 35,
    "currentlyServing": [ ... ],
    "waitingQueue": [ ... ]
  }
  ```

### 4. Book That Token / Appointment (Customer POV)
- **Endpoint**: `POST /api/appointments`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "customerId": 1,
    "serviceId": 2,
    "staffId": 1,
    "appointmentTime": "2026-09-08T14:30:00"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "appointmentId": 3,
    "tokenNumber": "T-003",
    "queuePosition": 3,
    "estimatedWaitMinutes": 35,
    "status": "CONFIRMED"
  }
  ```

### 5. Get Customer Appointments
- **Endpoint**: `GET /api/appointments/customer/{customerId}`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "customerId": 1,
      "customerName": "Rahul Sharma",
      "staffId": 1,
      "staffName": "Alex Rivera",
      "serviceId": 1,
      "serviceName": "Classic Haircut",
      "durationMinutes": 30,
      "price": 350.0,
      "appointmentTime": "2026-09-08T11:15:00",
      "status": "CONFIRMED",
      "createdAt": "2026-09-08T10:57:07"
    }
  ]
  ```

### 6. Cancel Customer Appointment
- **Endpoint**: `PUT /api/appointments/{id}/cancel`
- **Response** (`200 OK`): Updated appointment object with `status: "CANCELLED"` (queue positions for remaining waiting customers automatically shift).

### 7. View Live Queue for Customer
- **Endpoint**: `GET /api/queue/customer/{customerId}`
- **Response** (`200 OK`):
  ```json
  {
    "queueId": 2,
    "appointmentId": 2,
    "customerId": 1,
    "customerName": "Rahul Sharma",
    "service": "Beard Trim & Styling",
    "position": 1,
    "estimatedWaitMinutes": 0,
    "status": "WAITING"
  }
  ```
  *(Returns `204 No Content` if customer has no active queue entry).*

---

## ✂️ Module 2: Staff & Queue Operations (For Person 2 / Display Board)

### 1. View All Appointments
- **Endpoint**: `GET /api/appointments`
- **Response** (`200 OK`): List of all appointments across the system sorted newest first.

### 2. Today's Appointments
- **Endpoint**: `GET /api/appointments/today`
- **Response** (`200 OK`): List of appointments scheduled for today.

### 3. View Live Ongoing Token & Queue Summary (For TV / Queue Display)
- **Endpoint**: `GET /api/queue/ongoing` *(or `GET /api/queue/summary`)*
- **Response** (`200 OK`):
  ```json
  {
    "ongoingToken": "T-001",
    "ongoingCustomerName": "Rahul Sharma",
    "ongoingStylistName": "Alex Rivera",
    "totalServing": 1,
    "totalWaiting": 3,
    "estimatedWaitMinutes": 45,
    "currentlyServing": [
      {
        "queueId": 1,
        "appointmentId": 1,
        "tokenNumber": "T-001",
        "customerName": "Rahul Sharma",
        "service": "Classic Haircut",
        "staffName": "Alex Rivera",
        "position": 1,
        "estimatedWaitMinutes": 0,
        "status": "SERVING"
      }
    ],
    "waitingQueue": [
      {
        "queueId": 2,
        "appointmentId": 2,
        "tokenNumber": "T-002",
        "customerName": "Priya Sen",
        "service": "Beard Trim & Styling",
        "staffName": "Alex Rivera",
        "position": 1,
        "estimatedWaitMinutes": 10,
        "status": "WAITING"
      }
    ]
  }
  ```

### 4. View Live Queue List
- **Endpoint**: `GET /api/queue`
- **Response** (`200 OK`): List of all active items ordered by status (`SERVING` first, followed by `WAITING` in FIFO order):
  ```json
  [
    {
      "queueId": 1,
      "appointmentId": 1,
      "tokenNumber": "T-001",
      "customerName": "Rahul Sharma",
      "service": "Classic Haircut",
      "durationMinutes": 30,
      "staffName": "Alex Rivera",
      "position": 1,
      "estimatedWaitMinutes": 0,
      "status": "SERVING"
    },
    {
      "queueId": 2,
      "appointmentId": 2,
      "tokenNumber": "T-002",
      "customerName": "Priya Sen",
      "service": "Beard Trim & Styling",
      "durationMinutes": 15,
      "staffName": "Alex Rivera",
      "position": 1,
      "estimatedWaitMinutes": 10,
      "status": "WAITING"
    }
  ]
  ```

### 3. Start Service
- **Endpoint**: `PUT /api/queue/{id}/start`
- **Action**: Sets queue status to `SERVING`, sets estimated wait to `0`, and updates assigned staff status to `BUSY`.

### 4. Complete Service (Key Demo Trigger)
- **Endpoint**: `PUT /api/queue/{id}/complete`
- **Action**: Sets queue & appointment status to `COMPLETED`, frees staff (`AVAILABLE`), and **automatically recalculates positions and wait times for everyone behind**.

### 5. Mark No-Show
- **Endpoint**: `PUT /api/queue/{id}/no-show`
- **Action**: Sets appointment to `NO_SHOW`, frees staff, and recalculates queue.

### 6. Add Walk-In / Offline Customer to Live Queue
- **Endpoint**: `POST /api/queue/walk-in`
- **Description**: Registers an offline walk-in customer who arrives at the salon counter and instantly enters them into the live queue.
- **Request Body**:
  ```json
  {
    "customerName": "Amit Verma",
    "phoneNumber": "9876543210",
    "serviceId": 1,
    "staffId": 2
  }
  ```
  *(Note: Field aliases `selectService` and `assignStylist` are also supported for frontend convenience).*
- **Response** (`200 OK`):
  ```json
  {
    "queueId": 5,
    "appointmentId": 8,
    "customerId": null,
    "customerName": "Amit Verma",
    "customerPhone": "9876543210",
    "serviceId": 1,
    "service": "Classic Fade Haircut",
    "durationMinutes": 30,
    "staffId": 2,
    "staffName": "Alex Rivera",
    "position": 3,
    "estimatedWaitMinutes": 45,
    "status": "WAITING",
    "joinedAt": "2026-09-08T14:25:00"
  }
  ```

---

## 💇 Module 2.5: Stylist & Staff Management

### 1. Save / Create New Stylist
- **Endpoint**: `POST /api/staff`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "salonId": 1,
    "stylistName": "Vikram Sethi",
    "mobileNumber": "9876511223",
    "specialization": "Master Barber & Beard Stylist",
    "email": "vikram@salonpulse.com",
    "dutyStatus": "AVAILABLE"
  }
  ```
  *(Duty statuses: `AVAILABLE`, `BUSY`, `BREAK`, `OFFLINE`).*
- **Response** (`200 OK`):
  ```json
  {
    "id": 3,
    "salonId": 1,
    "salonName": "SalonPulse Flagship",
    "stylistName": "Vikram Sethi",
    "mobileNumber": "9876511223",
    "specialization": "Master Barber & Beard Stylist",
    "email": "vikram@salonpulse.com",
    "dutyStatus": "AVAILABLE"
  }
  ```

### 2. Fetch All Stylists / Staff
- **Fetch All**: `GET /api/staff`
- **Fetch for Specific Salon**:
  - `GET /api/staff/salon/{salonId}` *(Recommended)*
  - OR `GET /api/staff?salonId={salonId}`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "salonId": 1,
      "salonName": "SalonPulse Flagship",
      "stylistName": "Alex Rivera",
      "name": "Alex Rivera",
      "mobileNumber": "+91 98765 43211",
      "phone": "+91 98765 43211",
      "specialization": "Master Stylist & Beard Specialist",
      "email": "staff@demo.com",
      "dutyStatus": "AVAILABLE",
      "status": "AVAILABLE"
    },
    {
      "id": 2,
      "salonId": 1,
      "salonName": "SalonPulse Flagship",
      "stylistName": "Priya Patel",
      "name": "Priya Patel",
      "mobileNumber": "+91 98765 43212",
      "phone": "+91 98765 43212",
      "specialization": "Colorist & Facial Expert",
      "email": "priya@demo.com",
      "dutyStatus": "AVAILABLE",
      "status": "AVAILABLE"
    }
  ]
  ```

### 3. Update Stylist Duty Status (Quick Toggle)
- **Endpoint**: `PUT /api/staff/{id}/status`
- **Request Body**:
  ```json
  {
    "dutyStatus": "BREAK"
  }
  ```
- **Response** (`200 OK`): Updated stylist object with new duty status.

---

## 📊 Module 3: Admin Operations (For Person 3)

### 1. Admin Dashboard KPIs
- **Endpoint**: `GET /api/admin/dashboard`
- **Response** (`200 OK`):
  ```json
  {
    "todayBookings": 3,
    "waitingCustomers": 1,
    "currentlyServing": 1,
    "completed": 1,
    "cancelled": 0,
    "noShows": 0,
    "revenue": 350.00,
    "availableStaff": 1,
    "totalStaff": 2
  }
  ```

### 2. View All Salon Appointments
- **Endpoint**: `GET /api/admin/appointments`
- **Response** (`200 OK`): Full history of appointments.

### 3. View All Staff Status
- **Endpoint**: `GET /api/admin/staff`
- **Response** (`200 OK`): List of staff members with their current status (`AVAILABLE`, `BUSY`, `BREAK`, `OFFLINE`).

---

## 💳 Mock Payments & Refunds

### 1. Process Payment
- **Endpoint**: `POST /api/payments`
- **Request Body**:
  ```json
  {
    "appointmentId": 1,
    "amount": 350.00
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "paymentId": 1,
    "appointmentId": 1,
    "amount": 350.0,
    "status": "SUCCESS",
    "transactionRef": "TXN-EC802C1E"
  }
  ```

### 2. Process Refund
- **Endpoint**: `POST /api/refunds`
- **Request Body**:
  ```json
  {
    "paymentId": 1,
    "amount": 350.00
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "refundId": 1,
    "paymentId": 1,
    "amount": 350.0,
    "status": "REFUNDED"
  }
  ```

---

## 📍 Module 4: Location Management (States & Cities)

### 1. Save / Create State
- **Endpoint**: `POST /api/locations/states`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "stateCode": "KA",
    "stateName": "Karnataka"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "stateCode": "KA",
    "stateName": "Karnataka"
  }
  ```

### 2. Get All States (For State Dropdown)
- **Endpoint**: `GET /api/locations/states`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "stateCode": "KA",
      "stateName": "Karnataka"
    },
    {
      "id": 2,
      "stateCode": "MH",
      "stateName": "Maharashtra"
    }
  ]
  ```

### 3. Save / Create City
- **Endpoint**: `POST /api/locations/cities`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "stateId": 1,
    "cityCode": "BLR",
    "cityName": "Bangalore"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "cityCode": "BLR",
    "cityName": "Bangalore",
    "stateId": 1,
    "stateCode": "KA",
    "stateName": "Karnataka"
  }
  ```

### 4. Get Cities (All or Filtered by Selected State)
- **Endpoint**: `GET /api/locations/cities` or `GET /api/locations/cities?stateId=1`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "cityCode": "BLR",
      "cityName": "Bangalore",
      "stateId": 1,
      "stateCode": "KA",
      "stateName": "Karnataka"
    }
  ]
  ```

---

## 🏢 Module 5: Salon Details & Location Management

### 1. Get All Salons
- **Endpoint**: `GET /api/salons`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "name": "SalonPulse Flagship Indiranagar",
      "salonType": "UNISEX",
      "phone": "+91 98765 43210",
      "email": "flagship@salonpulse.com",
      "operatingTimings": "09:00 AM - 09:00 PM",
      "address": "101 100ft Road, Indiranagar",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "status": "ACTIVE"
    }
  ]
  ```

### 2. Get Salon by ID
- **Endpoint**: `GET /api/salons/{id}`
- **Response** (`200 OK`): Single salon object with all details.

### 3. Save / Create New Salon
- **Endpoint**: `POST /api/salons`
- **Request Body**:
  ```json
  {
    "name": "SalonPulse Mumbai Central",
    "salonType": "UNISEX",
    "phone": "+91 91234 56789",
    "email": "mumbai@salonpulse.com",
    "operatingTimings": "10:00 AM - 10:00 PM",
    "address": "Plot 45, Bandra West",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400050",
    "status": "ACTIVE"
  }
  ```
- **Response** (`200 OK`): Created salon with generated `id`.

### 4. Update Salon Details
- **Endpoint**: `PUT /api/salons/{id}`
- **Request Body**:
  ```json
  {
    "name": "SalonPulse Flagship Indiranagar",
    "salonType": "UNISEX",
    "phone": "+91 98765 43210",
    "email": "flagship@salonpulse.com",
    "operatingTimings": "09:00 AM - 09:30 PM",
    "address": "101 100ft Road, Indiranagar",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560038",
    "status": "ACTIVE"
  }
  ```
- **Response** (`200 OK`): Updated salon object.

---

## ⚡ Supabase Realtime Integration (For Frontend Developers)

Whenever the backend updates the `queue` or `appointments` table, Supabase Realtime broadcasts the change. To receive live updates without polling or page refresh:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Subscribe to queue table changes
const channel = supabase
  .channel('realtime-queue')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'queue' },
    (payload) => {
      console.log('Queue change received!', payload);
      // Re-fetch queue data via /api/queue or update state
      fetchQueue();
    }
  )
  .subscribe();
```
