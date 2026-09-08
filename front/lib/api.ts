/**
 * Scalable Java Spring Boot REST API Client
 * Target: http://192.168.137.94:8085/api
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.137.94:8085/api";

// Interfaces matching Java Spring Boot DTOs / Entity Contracts

export interface StateDTO {
  id?: number;
  stateCode: string;
  stateName: string;
}

export interface CityDTO {
  id?: number;
  cityCode: string;
  cityName: string;
  stateId?: number;
  stateName?: string;
  stateCode?: string;
}

export interface SalonDTO {
  id?: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  phone?: string;
  status: string;
  salonType?: string;
  pincode?: string;
  staffCount?: number;
}

export interface UserDTO {
  id?: number;
  fullName?: string;
  name: string;
  email: string;
  mobileNumber?: string | null;
  password?: string;
  confirmPassword?: string;
  cnfPassword?: string;
  role: string;
  userType?: string;
  staffId?: number | null;
  token?: string;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface DashboardMetricsDTO {
  totalBookings: number;
  totalUsers: number;
  totalSalons: number;
  completedToday: number;
  totalRevenue: number;
}

export interface AppointmentDTO {
  id: number;
  customerName: string;
  serviceName: string;
  staffName: string;
  appointmentTime: string;
  status: string;
  price: string;
}

export interface StaffDTO {
  id: number;
  name: string;
  role: string;
  status: string;
  currentCustomer?: string;
}

export interface RevenueDTO {
  id?: number;
  customer: string;
  amount: string;
  method: string;
  date: string;
  status: string;
}

/**
 * 2️⃣ Fetch All Salons (GET /api/salons)
 */
export async function getAdminSalons(): Promise<SalonDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/salons`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] Salons API unreachable at /api/salons:", error);
    return [];
  }
}

/**
 * 3️⃣ Fetch Single Salon by ID (GET /api/salons/{id})
 */
export async function getSalonById(id: number): Promise<SalonDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/salons/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[Java API Client] Salon ID ${id} unreachable:`, error);
    return null;
  }
}

/**
 * 1️⃣ Save / Create New Salon (POST /api/salons)
 */
export async function createAdminSalon(salon: SalonDTO): Promise<SalonDTO | null> {
  try {
    const payload = {
      name: salon.name,
      address: salon.address,
      city: salon.city,
      state: salon.state || "",
      phone: salon.phone || "",
      status: salon.status || "ACTIVE"
    };

    const response = await fetch(`${API_BASE_URL}/salons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[Java API Client] Error saving salon to /api/salons:", error);
    return null;
  }
}

/**
 * 4️⃣ Update Salon Details (PUT /api/salons/{id})
 */
export async function updateAdminSalon(id: number, salon: SalonDTO): Promise<SalonDTO | null> {
  try {
    const payload = {
      name: salon.name,
      address: salon.address,
      city: salon.city,
      state: salon.state || "",
      phone: salon.phone || "",
      status: salon.status || "ACTIVE"
    };

    const response = await fetch(`${API_BASE_URL}/salons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`[Java API Client] Error updating salon ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch All Users (GET /api/users)
 */
export async function getAdminUsers(): Promise<UserDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] Users API unreachable at /api/users:", error);
    return [];
  }
}

/**
 * Save / Create New User (POST /api/users)
 */
export async function createAdminUser(user: UserDTO): Promise<UserDTO | null> {
  try {
    // Map UI role to backend enum (Java only accepts: STAFF, CUSTOMER, ADMIN)
    const apiRole = user.role === "SALON_OWNER" ? "STAFF" : user.role;

    const payload = {
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || "",
      password: user.password || "",
      confirmPassword: user.confirmPassword || user.password || "",
      role: apiRole,
      userType: apiRole
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Java API Client] Error creating user at /api/users:", error);
    throw error;
  }
}

/**
 * User Login (POST /api/auth/login)
 */
export async function loginUser(credentials: LoginPayload): Promise<UserDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) throw new Error(`Login failed HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[Java API Client] Error logging in at /api/auth/login:", error);
    return null;
  }
}

/**
 * Fetch States List from Spring Boot (/api/locations/states)
 */
export async function getStates(): Promise<StateDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/states`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] States API unreachable:", error);
    return [];
  }
}

/**
 * Save New State to Spring Boot (/api/locations/states)
 */
export async function createState(state: StateDTO): Promise<StateDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/states`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[Java API Client] Error saving state:", error);
    return null;
  }
}

/**
 * Fetch Cities List from Spring Boot (/api/locations/cities)
 */
export async function getCities(stateId?: number): Promise<CityDTO[]> {
  try {
    const url = stateId ? `${API_BASE_URL}/locations/cities?stateId=${stateId}` : `${API_BASE_URL}/locations/cities`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] Cities API unreachable:", error);
    return [];
  }
}

/**
 * Save New City to Spring Boot (/api/locations/cities)
 */
export async function createCity(city: CityDTO): Promise<CityDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(city)
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[Java API Client] Error saving city:", error);
    return null;
  }
}

/**
 * Fetch Dashboard Metrics from Spring Boot (/api/dashboard)
 */
export async function getAdminDashboardMetrics(): Promise<DashboardMetricsDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] Dashboard API unreachable:", error);
    return null;
  }
}

/**
 * Fetch Appointments List from Spring Boot (/api/appointments)
 */
export async function getAdminAppointments(): Promise<AppointmentDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] Appointments API unreachable:", error);
    return [];
  }
}

/**
 * Fetch Staff Status List from Spring Boot (/api/staff)
 */
export async function getAdminStaff(): Promise<StaffDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Backend response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[Java API Client] Staff API unreachable:", error);
    return [];
  }
}

/**
 * Legacy getAdminLocations helper
 */
export async function getAdminLocations() {
  return await getCities();
}
