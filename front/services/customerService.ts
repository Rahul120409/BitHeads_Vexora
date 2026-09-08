import {
  CustomerUser,
  SalonService,
  StaffMember,
  CustomerAppointment,
  CustomerQueueStatus,
  mockCustomer,
  mockServices,
  mockStaffMembers,
  initialMockQueue,
  initialMockAppointments
} from '../mock/customerMock';

// Switch to false when Person 4's Spring Boot backend is running
export const USE_MOCK = true;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Helper for local storage persistence in mock mode
function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage [${key}]:`, e);
  }
}

export const customerService = {
  // Current authenticated user session (defaults to null if not logged in)
  getCurrentUser(): CustomerUser | null {
    if (typeof window === 'undefined') return null;
    return getStoredData<CustomerUser | null>('salonpulse_user', null);
  },

  setCurrentUser(user: CustomerUser | null): void {
    setStoredData('salonpulse_user', user);
  },

  // Auth: Login / Logout
  async login(email: string, role: 'CUSTOMER' | 'STAFF' | 'ADMIN' = 'CUSTOMER'): Promise<CustomerUser> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const user: CustomerUser = {
        id: role === 'CUSTOMER' ? 1 : role === 'STAFF' ? 101 : 999,
        name: role === 'CUSTOMER' ? 'Rahul Sharma' : role === 'STAFF' ? 'Raj Malhotra' : 'Salon Manager',
        email,
        phone: '+91 98765 43210',
        role
      };
      this.setCurrentUser(user);
      return user;
    }

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.setCurrentUser(data);
    return data;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salonpulse_user');
    }
  },

  // Services
  async getServices(): Promise<SalonService[]> {
    if (USE_MOCK) {
      return getStoredData<SalonService[]>('salonpulse_services', mockServices);
    }
    const res = await fetch(`${API_BASE_URL}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  // Staff
  async getStaff(): Promise<StaffMember[]> {
    if (USE_MOCK) {
      return getStoredData<StaffMember[]>('salonpulse_staff', mockStaffMembers);
    }
    const res = await fetch(`${API_BASE_URL}/admin/staff`);
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  // Appointments
  async getAppointments(customerId: number): Promise<CustomerAppointment[]> {
    if (USE_MOCK) {
      return getStoredData<CustomerAppointment[]>('salonpulse_appointments', initialMockAppointments);
    }
    const res = await fetch(`${API_BASE_URL}/appointments/customer/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  // Book Appointment -> Enters queue
  async bookAppointment(bookingData: {
    customerId: number;
    serviceId: number;
    staffId: number;
    appointmentTime: string;
    appointmentDate?: string;
  }): Promise<{
    appointmentId: number;
    queuePosition: number;
    estimatedWaitMinutes: number;
    status: string;
  }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const services = await this.getServices();
      const staff = await this.getStaff();
      const selectedService = services.find((s) => s.id === bookingData.serviceId) || services[0];
      const selectedStaff = staff.find((st) => st.id === bookingData.staffId) || staff[0];

      const currentAppointments = await this.getAppointments(bookingData.customerId);
      const newId = 100 + currentAppointments.length + 1;
      const currentQueue = await this.getQueueStatus(bookingData.customerId);
      const nextPosition = currentQueue ? currentQueue.position + 1 : 1;
      const waitMinutes = nextPosition * 15;

      const newAppointment: CustomerAppointment = {
        id: newId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        appointmentTime: bookingData.appointmentTime,
        appointmentDate: bookingData.appointmentDate || 'Today',
        price: selectedService.price,
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
        refundStatus: 'NOT_REQUESTED',
        queuePosition: nextPosition,
        estimatedWaitMinutes: waitMinutes
      };

      const updatedList = [newAppointment, ...currentAppointments];
      setStoredData('salonpulse_appointments', updatedList);

      const newQueueStatus: CustomerQueueStatus = {
        queueId: 200 + newId,
        appointmentId: newId,
        customerId: bookingData.customerId,
        customerName: 'Rahul Sharma',
        serviceName: selectedService.name,
        staffName: selectedStaff.name,
        position: nextPosition,
        peopleAhead: Math.max(0, nextPosition - 1),
        estimatedWaitMinutes: waitMinutes,
        status: 'WAITING',
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setStoredData('salonpulse_queue', newQueueStatus);

      return {
        appointmentId: newId,
        queuePosition: nextPosition,
        estimatedWaitMinutes: waitMinutes,
        status: 'CONFIRMED'
      };
    }

    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw new Error('Failed to book appointment');
    return res.json();
  },

  // Cancel Appointment
  async cancelAppointment(appointmentId: number): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const appointments = await this.getAppointments(1);
      const updated = appointments.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              status: 'CANCELLED' as const,
              refundStatus: apt.paymentStatus === 'SUCCESS' ? ('REFUNDED' as const) : ('NOT_REQUESTED' as const)
            }
          : apt
      );
      setStoredData('salonpulse_appointments', updated);

      const queue = await this.getQueueStatus(1);
      if (queue && queue.appointmentId === appointmentId) {
        setStoredData('salonpulse_queue', { ...queue, status: 'CANCELLED' });
      }

      return { success: true, message: 'Appointment cancelled successfully' };
    }

    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  },

  // Live Queue Status
  async getQueueStatus(customerId: number): Promise<CustomerQueueStatus | null> {
    if (USE_MOCK) {
      return getStoredData<CustomerQueueStatus | null>('salonpulse_queue', initialMockQueue);
    }
    const res = await fetch(`${API_BASE_URL}/queue/customer/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch queue status');
    return res.json();
  }
};
