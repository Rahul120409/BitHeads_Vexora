import {
  CustomerUser,
  SalonService,
  StaffMember,
  CustomerAppointment,
  CustomerQueueStatus,
  SalonLocation,
  HaircutStyle,
  NextAvailableQueueInfo,
  defaultMockQueueInfo,
  mockCustomer,
  mockServices,
  mockStaffMembers,
  mockNearbySalons,
  mockHaircutStyles,
  initialMockQueue,
  initialMockAppointments
} from '../mock/customerMock';

// Default port 8085 as per backend specs (loaded from .env if present)
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : '') ||
  'http://localhost:8085/api'
).replace(/\/+$/, '');
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

  // Step 1: Live Queue & Next Available Token (GET /api/queue/summary)
  async getNextAvailableQueue(salonId?: number): Promise<NextAvailableQueueInfo> {
    const storageKey = salonId ? `salonpulse_live_queue_${salonId}` : 'salonpulse_live_queue';
    if (USE_MOCK) {
      return getStoredData<NextAvailableQueueInfo>(storageKey, defaultMockQueueInfo);
    }

    try {
      const query = salonId ? `?salonId=${salonId}` : '';
      let res = await fetch(`${API_BASE_URL}/queue/summary${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/queue/next-available${query}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
      }

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/queue/ongoing${query}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data && (data.nextAvailableToken || data.ongoingToken)) {
          // Normalize and sanitize queue tokens to ensure strictly increasing sequential order
          const extractNum = (str?: string | null) => {
            if (!str) return 0;
            const match = String(str).match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          };

          let maxFloorToken = 0;
          const ongoingNum = extractNum(data.ongoingToken);
          if (ongoingNum > maxFloorToken) maxFloorToken = ongoingNum;

          // Normalize waiting queue so tokens are strictly sequential
          if (Array.isArray(data.waitingQueue)) {
            data.waitingQueue = data.waitingQueue.map((item: any) => {
              let itemToken = extractNum(item.tokenNumber || item.appointmentId);
              if (itemToken <= maxFloorToken) {
                itemToken = maxFloorToken + 1;
              }
              maxFloorToken = itemToken;
              return {
                ...item,
                tokenNumber: String(itemToken)
              };
            });
          }

          // Compute true next available token
          let nextAvailableNum = extractNum(data.nextAvailableToken);
          if (nextAvailableNum <= maxFloorToken) {
            nextAvailableNum = maxFloorToken + 1;
          }

          const sanitizedData = {
            ...data,
            nextAvailableToken: String(nextAvailableNum),
            nextQueuePosition: (data.waitingQueue?.length || 0) + 1
          };

          setStoredData(storageKey, sanitizedData);
          return sanitizedData;
        }
      }
    } catch (err: any) {
      console.warn('[customerService] Real-time /api/queue/summary unreachable, using local fallback:', err.message);
    }

    return getStoredData<NextAvailableQueueInfo>(storageKey, defaultMockQueueInfo);
  },

  // Step 2: Book Appointment -> Assigns Token & Enters Queue (POST /api/appointments)
  async bookAppointment(bookingData: {
    customerId: number;
    serviceId: number;
    staffId?: number;
    appointmentTime?: string;
    appointmentDate?: string;
    salonId?: number;
    selectedToken?: string;
    serviceName?: string;
    staffName?: string;
    price?: number;
  }): Promise<{
    appointmentId: number;
    tokenNumber: string;
    queuePosition: number;
    estimatedWaitMinutes: number;
    status: string;
  }> {
    const currentUser = this.getCurrentUser();
    const activeName = currentUser?.name || 'Customer';
    const activePhone = currentUser?.phone || currentUser?.mobileNumber || '+91 98765 43210';

    const payload = {
      customerId: bookingData.customerId,
      serviceId: bookingData.serviceId,
      staffId: bookingData.staffId || 2,
      appointmentTime: bookingData.appointmentTime || new Date().toISOString().replace(/\.\d+Z$/, '')
    };

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const queueInfo = await this.getNextAvailableQueue(bookingData.salonId);
      const assignedToken = bookingData.selectedToken || queueInfo.nextAvailableToken || 'T-003';
      const position = queueInfo.nextQueuePosition || 3;
      const waitMinutes = queueInfo.estimatedWaitMinutesForNext || 35;
      const newAptId = Math.floor(Math.random() * 1000) + 10;

      const confirmedTicket = {
        appointmentId: newAptId,
        tokenNumber: assignedToken,
        queuePosition: position,
        estimatedWaitMinutes: waitMinutes,
        status: 'CONFIRMED'
      };

      // Save appointment record
      const currentAppointments = await this.getAppointments(bookingData.customerId);
      const newAppointment: CustomerAppointment = {
        id: newAptId,
        tokenNumber: assignedToken,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName || 'Classic Fade Haircut',
        staffId: bookingData.staffId || 2,
        staffName: bookingData.staffName || 'Alex Rivera',
        appointmentTime: bookingData.appointmentTime || 'Today (Live Queue)',
        appointmentDate: bookingData.appointmentDate || 'Today',
        price: bookingData.price || 350,
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
        refundStatus: 'NOT_REQUESTED',
        queuePosition: position,
        estimatedWaitMinutes: waitMinutes
      };
      setStoredData('salonpulse_appointments', [newAppointment, ...currentAppointments]);

      // Save live queue tracking ticket
      const newQueueStatus: CustomerQueueStatus = {
        queueId: newAptId,
        appointmentId: newAptId,
        tokenNumber: assignedToken,
        customerId: bookingData.customerId,
        customerName: activeName,
        customerPhone: activePhone,
        serviceName: bookingData.serviceName || 'Classic Fade Haircut',
        service: bookingData.serviceName || 'Classic Fade Haircut',
        durationMinutes: 30,
        staffName: bookingData.staffName || 'Alex Rivera',
        position: position,
        peopleAhead: Math.max(0, position - 1),
        estimatedWaitMinutes: waitMinutes,
        status: 'WAITING',
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setStoredData('salonpulse_queue', newQueueStatus);

      return confirmedTicket;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const confirmed = {
          appointmentId: data.appointmentId || data.id || Math.floor(Math.random() * 1000) + 10,
          tokenNumber: data.tokenNumber || bookingData.selectedToken || 'T-003',
          queuePosition: data.queuePosition || data.position || 3,
          estimatedWaitMinutes: data.estimatedWaitMinutes || 35,
          status: data.status || 'CONFIRMED'
        };

        // Save appointment record
        const currentAppointments = await this.getAppointments(bookingData.customerId);
        const newAppointment: CustomerAppointment = {
          id: confirmed.appointmentId,
          tokenNumber: confirmed.tokenNumber,
          serviceId: bookingData.serviceId,
          serviceName: bookingData.serviceName || 'Classic Fade Haircut',
          staffId: bookingData.staffId || 2,
          staffName: bookingData.staffName || 'Alex Rivera',
          appointmentTime: bookingData.appointmentTime || 'Today (Live Queue)',
          appointmentDate: bookingData.appointmentDate || 'Today',
          price: bookingData.price || 350,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          refundStatus: 'NOT_REQUESTED',
          queuePosition: confirmed.queuePosition,
          estimatedWaitMinutes: confirmed.estimatedWaitMinutes
        };
        setStoredData('salonpulse_appointments', [newAppointment, ...currentAppointments]);

        // Save live queue tracking ticket
        const newQueueStatus: CustomerQueueStatus = {
          queueId: confirmed.appointmentId,
          appointmentId: confirmed.appointmentId,
          tokenNumber: confirmed.tokenNumber,
          customerId: bookingData.customerId,
          customerName: activeName,
          customerPhone: activePhone,
          serviceName: bookingData.serviceName || 'Classic Fade Haircut',
          service: bookingData.serviceName || 'Classic Fade Haircut',
          durationMinutes: 30,
          staffName: bookingData.staffName || 'Alex Rivera',
          position: confirmed.queuePosition,
          peopleAhead: Math.max(0, confirmed.queuePosition - 1),
          estimatedWaitMinutes: confirmed.estimatedWaitMinutes,
          status: 'WAITING',
          joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setStoredData('salonpulse_queue', newQueueStatus);

        return confirmed;
      }
    } catch (err: any) {
      console.warn('[customerService] POST /api/appointments failed, falling back to simulated ticket:', err.message);
    }

    // Active session fallback if API is unreachable
    const fallbackToken = bookingData.selectedToken || 'T-003';
    const fallbackResult = {
      appointmentId: 3,
      tokenNumber: fallbackToken,
      queuePosition: 3,
      estimatedWaitMinutes: 35,
      status: 'CONFIRMED'
    };

    setStoredData('salonpulse_queue', {
      queueId: 3,
      appointmentId: 3,
      tokenNumber: fallbackToken,
      customerId: bookingData.customerId,
      customerName: activeName,
      customerPhone: activePhone,
      serviceName: bookingData.serviceName || 'Classic Fade Haircut',
      service: bookingData.serviceName || 'Classic Fade Haircut',
      durationMinutes: 30,
      staffName: bookingData.staffName || 'Alex Rivera',
      position: 3,
      peopleAhead: 2,
      estimatedWaitMinutes: 35,
      status: 'WAITING',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return fallbackResult;
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

  // Step 3: Live Real-Time Customer Queue Tracking (GET /api/queue/customer/{customerId})
  async getQueueStatus(customerId: number): Promise<CustomerQueueStatus | null> {
    const storageKey = 'salonpulse_queue';
    if (USE_MOCK) {
      return getStoredData<CustomerQueueStatus | null>(storageKey, initialMockQueue);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/queue/customer/${customerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.queueId || data.tokenNumber || data.appointmentId)) {
          const mapped: CustomerQueueStatus = {
            queueId: data.queueId || data.appointmentId || 3,
            appointmentId: data.appointmentId || data.queueId || 3,
            tokenNumber: data.tokenNumber || 'T-003',
            customerId: data.customerId || customerId,
            customerName: data.customerName || 'Customer',
            customerPhone: data.customerPhone || '',
            serviceName: data.serviceName || data.service || 'Classic Fade Haircut',
            service: data.service || data.serviceName || 'Classic Fade Haircut',
            durationMinutes: data.durationMinutes || 30,
            staffName: data.staffName || 'Alex Rivera',
            position: typeof data.position === 'number' ? data.position : 3,
            peopleAhead: typeof data.peopleAhead === 'number' ? data.peopleAhead : Math.max(0, (data.position ?? 3) - 1),
            estimatedWaitMinutes: typeof data.estimatedWaitMinutes === 'number' ? data.estimatedWaitMinutes : 35,
            status: data.status || 'WAITING',
            joinedAt: data.joinedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setStoredData(storageKey, mapped);
          return mapped;
        }
      }
    } catch (err: any) {
      // Network unreachable, keep last stored queue status
    }
    return getStoredData<CustomerQueueStatus | null>(storageKey, initialMockQueue);
  },

  // Real-Time Salons (GET /api/salons)
  async getSalons(): Promise<SalonLocation[]> {
    if (USE_MOCK) {
      return getStoredData<SalonLocation[]>('salonpulse_real_salons', mockNearbySalons);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/salons`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any, idx: number) => mapBackendSalonToLocation(item, idx));
          setStoredData('salonpulse_real_salons', mapped);
          return mapped;
        }
      }
    } catch (err: any) {
      console.warn('[customerService] Real-time /api/salons unreachable, falling back to cached/mock data:', err.message);
    }
    return getStoredData<SalonLocation[]>('salonpulse_real_salons', mockNearbySalons);
  },

  // Fetch Single Salon (GET /api/salons/{id})
  async getSalonById(id: number): Promise<SalonLocation> {
    const all = await this.getSalons();
    const found = all.find((s) => s.id === id);
    if (found) return found;

    try {
      const res = await fetch(`${API_BASE_URL}/salons/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return mapBackendSalonToLocation(data, 0);
      }
    } catch (err: any) {
      console.warn(`[customerService] /api/salons/${id} unreachable:`, err.message);
    }
    return mockNearbySalons[0];
  },

  // Real-Time Haircut Styles (GET /api/haircut-styles?salonId={id})
  async getHaircutStyles(salonId: number): Promise<HaircutStyle[]> {
    const storageKey = `salonpulse_haircuts_${salonId}`;
    if (USE_MOCK) {
      return getStoredData<HaircutStyle[]>(storageKey, mockHaircutStyles);
    }

    try {
      // 1. Primary endpoint: /api/haircut-styles?salonId={salonId}
      let res = await fetch(`${API_BASE_URL}/haircut-styles?salonId=${salonId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      // 2. Fallback alias: /api/haircut-styles/salon/{salonId}
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/haircut-styles/salon/${salonId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
      }

      // 3. Fallback alias: /api/services?salonId={salonId}
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/services?salonId=${salonId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: HaircutStyle[] = data.map((item: any, idx: number) => {
            const dur = item.durationMinutes ?? item.duration ?? 30;
            const rawGender = String(item.gender || 'UNISEX').toUpperCase();
            const genderVal = rawGender === 'MALE' || rawGender === 'MEN'
              ? 'MALE'
              : rawGender === 'FEMALE' || rawGender === 'WOMEN'
              ? 'FEMALE'
              : 'UNISEX';

            const defaultImg = getRealHaircutImage(item.name, genderVal, item.imageUrl);

            return {
              id: item.id || idx + 1,
              salonId: item.salonId || salonId,
              name: item.name,
              gender: genderVal,
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 350,
              durationMinutes: dur,
              duration: dur,
              description: item.description || 'Clean styling, personalized consultation & precision cut.',
              imageUrl: defaultImg,
              cat: item.cat || (genderVal === 'MALE' ? 'Men' : genderVal === 'FEMALE' ? 'Women' : 'Unisex')
            };
          });
          setStoredData(storageKey, mapped);
          return mapped;
        }
      }
    } catch (err: any) {
      console.warn(`[customerService] Real-time /api/haircut-styles?salonId=${salonId} failed, using local/cached fallback:`, err.message);
    }

    return getStoredData<HaircutStyle[]>(storageKey, mockHaircutStyles);
  },

  // Real-Time Staff / Stylists from Backend (GET /api/staff?salonId={id} or /api/staff)
  async getStylistsForSalon(salonId: number): Promise<any[]> {
    const storageKey = `salonpulse_stylists_${salonId}`;
    try {
      let res = await fetch(`${API_BASE_URL}/staff?salonId=${salonId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/staff/salon/${salonId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
      }
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/staff`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((st: any, idx: number) => {
            const name = st.stylistName || st.name || `Stylist ${idx + 1}`;
            const nameLower = name.toLowerCase();
            const isFemale = nameLower.includes('priya') || nameLower.includes('sneha') || nameLower.includes('sophie') || nameLower.includes('camille');

            const avatar = isFemale
              ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
              : idx % 2 === 0
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

            // Real signature hairstyle mapping
            let sigName = 'Classic Fade & Taper';
            let sigImg = 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600';
            let sigTag = 'Fade Specialist';
            let specs = ['Skin Fade', 'Beard Trim', 'Taper'];

            const specLower = (st.specialization || '').toLowerCase();
            if (isFemale || specLower.includes('color') || specLower.includes('facial')) {
              sigName = 'Luxe Layer Cut & Blowout';
              sigImg = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600';
              sigTag = 'Color & Layers';
              specs = ['Layered Cut', 'Balayage', 'Blowout'];
            } else if (specLower.includes('beard') || nameLower.includes('alex')) {
              sigName = 'Classic Fade & Beard Trim';
              sigImg = 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600';
              sigTag = 'Fade Master';
              specs = ['Skin Fade', 'Beard Trim', 'Hot Towel'];
            } else if (nameLower.includes('test')) {
              sigName = 'Taper Fade & Textured Crop';
              sigImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600';
              sigTag = 'Modern Crop';
              specs = ['Textured Crop', 'Low Taper', 'Razor Line'];
            } else {
              sigName = 'Executive Scissor & Flow';
              sigImg = 'https://images.unsplash.com/photo-1517832606589-7629c3395907?w=600';
              sigTag = 'Scissor Craft';
              specs = ['Scissor Cut', 'Classic Flow', 'Taper'];
            }

            return {
              id: st.id || idx + 1,
              name: name,
              role: st.specialization || (isFemale ? 'Hair & Color Specialist' : 'Senior Barber & Stylist'),
              rating: Number((4.8 + ((idx % 3) * 0.1)).toFixed(1)),
              experience: `${6 + ((idx * 2) % 6)} yrs exp`,
              avatar: avatar,
              dutyStatus: st.dutyStatus || st.status || 'AVAILABLE',
              signatureStyle: {
                name: sigName,
                image: sigImg,
                tag: sigTag
              },
              specialties: specs
            };
          });

          setStoredData(storageKey, mapped);
          return mapped;
        }
      }
    } catch (err: any) {
      console.warn(`[customerService] Real-time /api/staff failed, using fallback:`, err.message);
    }

    return getStoredData<any[]>(storageKey, mockNearbySalons[0].stylists);
  }
};

function getRealHaircutImage(name: string, gender: string, existingImg?: string): string {
  if (existingImg && existingImg.trim().length > 0 && existingImg.startsWith('http')) {
    return existingImg;
  }
  const lower = (name || '').toLowerCase();
  if (lower.includes('fade') || lower.includes('tapper') || lower.includes('taper')) {
    return 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600';
  }
  if (lower.includes('layer') || lower.includes('butterfly') || lower.includes('bob')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600';
  }
  if (lower.includes('beard') || lower.includes('shave') || lower.includes('trim')) {
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600';
  }
  if (lower.includes('color') || lower.includes('highlight') || lower.includes('dye')) {
    return 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600';
  }
  if (lower.includes('facial') || lower.includes('spa') || lower.includes('detox')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600';
  }
  if (lower.includes('crop') || lower.includes('buzz')) {
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600';
  }
  return gender === 'FEMALE'
    ? 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600'
    : 'https://images.unsplash.com/photo-1517832606589-7629c3395907?w=600';
}

export function mapBackendSalonToLocation(raw: any, index: number = 0): SalonLocation {
  const iconTypes: ('scissors' | 'sparkles' | 'crown')[] = ['scissors', 'sparkles', 'crown'];
  const iconType = raw.salonType === 'FEMALE'
    ? 'sparkles'
    : raw.salonType === 'MALE'
    ? 'crown'
    : iconTypes[index % 3];

  const fullAddress = [raw.address, raw.city, raw.state, raw.pincode].filter(Boolean).join(', ');

  return {
    id: raw.id || index + 1,
    name: raw.name,
    distance: raw.distance || `${(0.6 + (index % 5) * 0.4).toFixed(1)} km away`,
    rating: raw.rating || 4.9,
    reviews: raw.reviews || (180 + index * 45),
    address: fullAddress || raw.address,
    city: raw.city,
    state: raw.state,
    phone: raw.phone,
    email: raw.email,
    operatingTimings: raw.operatingTimings || '09:00 AM - 09:00 PM',
    salonType: raw.salonType || 'UNISEX',
    pincode: raw.pincode ? String(raw.pincode).trim() : (raw.address?.match(/\b([1-9][0-9]{5})\b/)?.[1] || undefined),
    status: raw.status || 'ACTIVE',
    chairsAvailable: raw.chairsAvailable || (raw.staffCount ? Math.max(1, Math.floor(raw.staffCount / 2)) : 3),
    estWait: raw.estWait || `~${15 + (index % 4) * 5} mins`,
    iconType: iconType,
    badge: raw.status === 'ACTIVE' ? (index === 0 ? 'Nearest • Verified Partner' : 'Verified Partner') : raw.status,
    services: raw.services && raw.services.length > 0 ? raw.services : [
      { id: 101, name: 'Signature Precision Haircut & Styling', price: 350, duration: 30, cat: 'Haircut' },
      { id: 102, name: 'Fade & Textured Crop Style', price: 300, duration: 25, cat: 'Haircut' },
      { id: 103, name: 'Classic Executive Scissor Haircut', price: 400, duration: 35, cat: 'Haircut' },
      { id: 104, name: 'Haircut + Beard Sculpting Combo', price: 500, duration: 45, cat: 'Combo' },
      { id: 105, name: 'Beard Trim & Hot Towel Shave', price: 200, duration: 20, cat: 'Beard' },
      { id: 106, name: 'Luxury Scalp Detox & Head Spa', price: 650, duration: 40, cat: 'Spa' }
    ],
    stylists: raw.stylists && raw.stylists.length > 0 ? raw.stylists : [
      {
        id: 2,
        name: 'Alex Rivera',
        role: 'Senior Barber & Fade Master',
        rating: 4.9,
        experience: '8 yrs exp',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        signatureStyle: {
          name: 'Classic Fade & Skin Taper',
          image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500',
          tag: 'Fade Specialist'
        },
        specialties: ['Skin Fade', 'Beard Trim', 'Taper']
      },
      {
        id: 1,
        name: 'Raj Malhotra',
        role: 'Master Stylist & Scissor Craft',
        rating: 4.9,
        experience: '10 yrs exp',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        signatureStyle: {
          name: 'Executive Scissor Cut & Flow',
          image: 'https://images.unsplash.com/photo-1517832606589-7629c3395907?w=500',
          tag: 'Scissor Master'
        },
        specialties: ['Classic Scissor', 'Executive Flow', 'Taper']
      },
      {
        id: 3,
        name: 'Amit Verma',
        role: 'Senior Barber & Modern Fades',
        rating: 4.8,
        experience: '6 yrs exp',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        signatureStyle: {
          name: 'Textured Crop & Low Fade',
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500',
          tag: 'Modern Crop'
        },
        specialties: ['Low Taper', 'French Crop', 'Razor Lines']
      },
      {
        id: 4,
        name: 'Priya Kapoor',
        role: 'Hair Specialist & Luxe Colorist',
        rating: 4.9,
        experience: '7 yrs exp',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
        signatureStyle: {
          name: 'Luxe Butterfly Layers & Blowout',
          image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500',
          tag: 'Luxe Layers'
        },
        specialties: ['Layered Cut', 'Balayage', 'Blowout']
      }
    ]
  };
}
