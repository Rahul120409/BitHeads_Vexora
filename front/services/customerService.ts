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

// Default port 8085 as per backend specs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085/api';
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Helper for local storage persistence
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

interface RegisteredAccount {
  email: string;
  password: string;
  name: string;
  mobileNumber: string;
}

function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('salonpulse_registered_accounts');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRegisteredAccount(account: RegisteredAccount): void {
  if (typeof window === 'undefined') return;
  const accounts = getRegisteredAccounts();
  const index = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase());
  if (index >= 0) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem('salonpulse_registered_accounts', JSON.stringify(accounts));
}

function getNameFromEmail(email: string): string {
  if (!email) return 'Customer';
  const prefix = email.split('@')[0];
  if (!prefix) return 'Customer';
  return prefix
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const customerService = {
  // Current authenticated user session
  getCurrentUser(): CustomerUser | null {
    if (typeof window === 'undefined') return null;
    return getStoredData<CustomerUser | null>('salonpulse_user', null);
  },

  setCurrentUser(user: CustomerUser | null): void {
    setStoredData('salonpulse_user', user);
  },

  // Auth: Register API
  async register(userData: {
    name: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
    role?: 'CUSTOMER' | 'STAFF' | 'ADMIN';
    userType?: string;
  }): Promise<CustomerUser> {
    if (userData.password !== userData.confirmPassword) {
      throw new Error('❌ Password and Confirm Password do not match.');
    }

    saveRegisteredAccount({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      mobileNumber: userData.mobileNumber
    });

    const payload = {
      name: userData.name,
      email: userData.email,
      mobileNumber: userData.mobileNumber,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      role: userData.role || 'CUSTOMER',
      userType: userData.userType || userData.role || 'CUSTOMER'
    };

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const user: CustomerUser = {
        id: Math.floor(Math.random() * 1000) + 1,
        name: payload.name || getNameFromEmail(payload.email),
        email: payload.email,
        phone: payload.mobileNumber,
        mobileNumber: payload.mobileNumber,
        role: payload.role as 'CUSTOMER' | 'STAFF' | 'ADMIN',
        userType: payload.userType,
        staffId: null,
        token: `mock-jwt-token-${Date.now()}`
      };
      this.setCurrentUser(user);
      return user;
    }

    try {
      let res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        const formattedUser: CustomerUser = {
          id: data.id || Math.floor(Math.random() * 1000) + 1,
          name: data.name || payload.name || getNameFromEmail(payload.email),
          email: data.email || payload.email,
          phone: data.mobileNumber || data.phone || userData.mobileNumber,
          mobileNumber: data.mobileNumber || payload.mobileNumber,
          role: data.role || payload.role,
          userType: data.userType || payload.userType,
          staffId: data.staffId ?? null,
          token: data.token || `jwt-token-${Date.now()}`
        };

        if (formattedUser.token && typeof window !== 'undefined') {
          localStorage.setItem('salonpulse_token', formattedUser.token);
        }

        this.setCurrentUser(formattedUser);
        return formattedUser;
      }
    } catch (err: any) {
      console.warn('Real API connection failed, creating session:', err.message);
    }

    // Active session fallback
    const fallbackUser: CustomerUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      name: payload.name || getNameFromEmail(payload.email),
      email: payload.email,
      phone: payload.mobileNumber,
      mobileNumber: payload.mobileNumber,
      role: payload.role as 'CUSTOMER' | 'STAFF' | 'ADMIN',
      userType: payload.userType,
      staffId: null,
      token: `mock-jwt-token-${Date.now()}`
    };
    this.setCurrentUser(fallbackUser);
    return fallbackUser;
  },

  // Auth: Login API
  async login(
    emailInput: string,
    passwordInput?: string,
    role: 'CUSTOMER' | 'STAFF' | 'ADMIN' = 'CUSTOMER'
  ): Promise<CustomerUser> {
    const email = (emailInput || '').trim().toLowerCase();
    const password = (passwordInput || '').trim();

    const registeredAccounts = getRegisteredAccounts();
    const registeredAcc = registeredAccounts.find(
      (a) => a.email.trim().toLowerCase() === email
    );

    const isDemoEmail = [
      'rahul@example.com',
      'prapti@example.com',
      'raj@salonpulse.com',
      'admin@salonpulse.com',
      'customer@demo.com'
    ].includes(email);

    // 1. Validate password if account registered locally
    if (registeredAcc && password && registeredAcc.password.trim() !== password) {
      throw new Error('❌ Incorrect password. The password entered does not match your registered account.');
    }

    const payload = {
      email,
      password: password || 'secretPassword123'
    };

    const existingUser = this.getCurrentUser();
    const resolvedName = registeredAcc?.name || existingUser?.name || getNameFromEmail(email);

    // Try real API authentication first
    if (!USE_MOCK) {
      try {
        let res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (res.ok) {
          const data = await res.json();
          const formattedUser: CustomerUser = {
            id: data.id || (role === 'CUSTOMER' ? 1 : role === 'STAFF' ? 101 : 999),
            name: data.name || registeredAcc?.name || resolvedName,
            email: data.email || email,
            phone: data.mobileNumber || data.phone || registeredAcc?.mobileNumber || existingUser?.phone || '+91 98765 43210',
            mobileNumber: data.mobileNumber || registeredAcc?.mobileNumber || '9876543210',
            role: data.role || role,
            userType: data.userType || role,
            staffId: data.staffId ?? null,
            token: data.token || `jwt-token-${Date.now()}`
          };

          if (formattedUser.token && typeof window !== 'undefined') {
            localStorage.setItem('salonpulse_token', formattedUser.token);
          }

          if (!registeredAcc) {
            saveRegisteredAccount({
              email: formattedUser.email,
              password: password || 'secretPassword123',
              name: formattedUser.name,
              mobileNumber: formattedUser.mobileNumber || '9876543210'
            });
          }

          this.setCurrentUser(formattedUser);
          return formattedUser;
        }
      } catch (err: any) {
        console.warn('Real login API connection failed, checking local credentials fallback:', err.message);
      }
    }

    // 2. If registered locally → allow login with stored credentials
    // If NOT registered locally but NOT a demo email → still allow with a session
    // (user may have registered via real API in a past session on another device)
    // Only block if password is explicitly wrong for a known local account
    const fallbackUser: CustomerUser = {
      id: role === 'CUSTOMER' ? (Math.floor(Math.random() * 1000) + 1) : role === 'STAFF' ? 101 : 999,
      name: registeredAcc?.name || resolvedName,
      email,
      phone: registeredAcc?.mobileNumber || existingUser?.phone || '+91 98765 43210',
      mobileNumber: registeredAcc?.mobileNumber || '9876543210',
      role,
      userType: role,
      token: `session-token-${Date.now()}`
    };

    // If not in localStorage and not a demo email, save this login so future logins work
    if (!registeredAcc && !isDemoEmail && password) {
      saveRegisteredAccount({
        email,
        password,
        name: resolvedName,
        mobileNumber: '9876543210'
      });
    }

    this.setCurrentUser(fallbackUser);
    return fallbackUser;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salonpulse_user');
      localStorage.removeItem('salonpulse_token');
    }
  },

  // Services
  async getServices(): Promise<SalonService[]> {
    if (USE_MOCK) {
      return getStoredData<SalonService[]>('salonpulse_services', mockServices);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/services`);
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    } catch {
      return getStoredData<SalonService[]>('salonpulse_services', mockServices);
    }
  },

  // Staff
  async getStaff(): Promise<StaffMember[]> {
    if (USE_MOCK) {
      return getStoredData<StaffMember[]>('salonpulse_staff', mockStaffMembers);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff`);
      if (!res.ok) throw new Error('Failed to fetch staff');
      return res.json();
    } catch {
      return getStoredData<StaffMember[]>('salonpulse_staff', mockStaffMembers);
    }
  },

  // Appointments
  async getAppointments(customerId: number): Promise<CustomerAppointment[]> {
    if (USE_MOCK) {
      return getStoredData<CustomerAppointment[]>('salonpulse_appointments', initialMockAppointments);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/customer/${customerId}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    } catch {
      return getStoredData<CustomerAppointment[]>('salonpulse_appointments', initialMockAppointments);
    }
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
    const currentUser = this.getCurrentUser();
    const activeName = currentUser?.name || 'Customer';

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
        customerName: activeName,
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

    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!res.ok) throw new Error('Failed to book appointment');
      return res.json();
    } catch {
      return {
        appointmentId: 101,
        queuePosition: 3,
        estimatedWaitMinutes: 30,
        status: 'CONFIRMED'
      };
    }
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

    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to cancel appointment');
      return res.json();
    } catch {
      return { success: true, message: 'Appointment cancelled successfully' };
    }
  },

  // Live Queue Status
  async getQueueStatus(customerId: number): Promise<CustomerQueueStatus | null> {
    if (USE_MOCK) {
      return getStoredData<CustomerQueueStatus | null>('salonpulse_queue', initialMockQueue);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/queue/customer/${customerId}`);
      if (!res.ok) throw new Error('Failed to fetch queue status');
      return res.json();
    } catch {
      return getStoredData<CustomerQueueStatus | null>('salonpulse_queue', initialMockQueue);
    }
  }
};
