export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  mobileNumber?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  userType?: string;
  staffId?: number | null;
  token?: string;
}

export interface SalonService {
  id: number;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
  popular?: boolean;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  rating: number;
  status: 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFFLINE';
  avatar?: string;
}

export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type QueueStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type RefundStatus = 'NOT_REQUESTED' | 'PROCESSING' | 'REFUNDED' | 'FAILED';

export interface CustomerAppointment {
  id: number;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  appointmentTime: string;
  appointmentDate: string;
  price: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  refundStatus?: RefundStatus;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
}

export interface CustomerQueueStatus {
  queueId: number;
  appointmentId: number;
  customerId: number;
  customerName: string;
  serviceName: string;
  staffName: string;
  position: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  joinedAt: string;
}

// Current logged in demo customer
export const mockCustomer: CustomerUser = {
  id: 1,
  name: "Prapti Meher",
  email: "prapti@example.com",
  phone: "+91 98765 43210",
  role: "CUSTOMER"
};

// Available services
export const mockServices: SalonService[] = [
  {
    id: 1,
    name: "Signature Haircut & Style",
    category: "Hair",
    durationMinutes: 30,
    price: 350,
    description: "Personalized consultation, precision cut, rinse & premium blowdry style.",
    popular: true
  },
  {
    id: 2,
    name: "Beard Trim & Precision Shave",
    category: "Beard",
    durationMinutes: 20,
    price: 200,
    description: "Razor sharp detailing, hot towel compress, and soothing balm treatment.",
    popular: true
  },
  {
    id: 3,
    name: "Detox Scalp Massage & Hair Spa",
    category: "Spa",
    durationMinutes: 45,
    price: 750,
    description: "Deep conditioning root treatment with therapeutic head and shoulder massage."
  },
  {
    id: 4,
    name: "Charcoal Deep Cleanse Facial",
    category: "Skin",
    durationMinutes: 40,
    price: 600,
    description: "Pore cleansing, gentle steam exfoliation and antioxidant hydration mask."
  },
  {
    id: 5,
    name: "Hair Color & Highlights",
    category: "Hair",
    durationMinutes: 60,
    price: 1200,
    description: "Ammonia-free organic dye with custom tonal balayage or root touch-up."
  }
];

// Available stylists
export const mockStaffMembers: StaffMember[] = [
  {
    id: 101,
    name: "Raj Malhotra",
    role: "Master Stylist",
    rating: 4.9,
    status: "AVAILABLE"
  },
  {
    id: 102,
    name: "Amit Verma",
    role: "Senior Barber",
    rating: 4.8,
    status: "AVAILABLE"
  },
  {
    id: 103,
    name: "Priya Kapoor",
    role: "Skin & Spa Specialist",
    rating: 4.9,
    status: "BUSY"
  }
];

// Active Queue state for Rahul
export const initialMockQueue: CustomerQueueStatus = {
  queueId: 101,
  appointmentId: 105,
  customerId: 1,
  customerName: "Rahul Sharma",
  serviceName: "Signature Haircut & Style",
  staffName: "Raj Malhotra",
  position: 3,
  peopleAhead: 2,
  estimatedWaitMinutes: 20,
  status: "WAITING",
  joinedAt: "10:10 AM"
};

// Initial Appointment records
export const initialMockAppointments: CustomerAppointment[] = [
  {
    id: 105,
    serviceId: 1,
    serviceName: "Signature Haircut & Style",
    staffId: 101,
    staffName: "Raj Malhotra",
    appointmentTime: "10:30 AM",
    appointmentDate: "Today",
    price: 350,
    status: "CONFIRMED",
    paymentStatus: "PENDING",
    refundStatus: "NOT_REQUESTED",
    queuePosition: 3,
    estimatedWaitMinutes: 20
  },
  {
    id: 104,
    serviceId: 2,
    serviceName: "Beard Trim & Precision Shave",
    staffId: 102,
    staffName: "Amit Verma",
    appointmentTime: "04:00 PM",
    appointmentDate: "Last Week",
    price: 200,
    status: "COMPLETED",
    paymentStatus: "SUCCESS",
    refundStatus: "NOT_REQUESTED"
  },
  {
    id: 103,
    serviceId: 3,
    serviceName: "Detox Scalp Massage & Hair Spa",
    staffId: 103,
    staffName: "Priya Kapoor",
    appointmentTime: "11:00 AM",
    appointmentDate: "Last Month",
    price: 750,
    status: "CANCELLED",
    paymentStatus: "FAILED",
    refundStatus: "REFUNDED"
  }
];

export interface SalonLocation {
  id: number;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  address: string;
  chairsAvailable: number;
  estWait: string;
  image: string;
  badge?: string;
  services: { id: number; name: string; price: number; duration: number; cat: string }[];
  stylists: { id: number; name: string; role: string; rating: number }[];
}

export const mockNearbySalons: SalonLocation[] = [
  {
    id: 1,
    name: 'SalonPulse Downtown Studio',
    distance: '0.8 km away',
    rating: 4.9,
    reviews: 340,
    address: '42 MG Road, Metro Promenade, Downtown',
    chairsAvailable: 3,
    estWait: '~15 mins',
    image: '✂️',
    badge: 'Nearest • Verified Partner',
    services: [
      { id: 101, name: 'Signature Precision Haircut & Styling', price: 350, duration: 30, cat: 'Haircut' },
      { id: 102, name: 'Fade & Textured Crop Style', price: 300, duration: 25, cat: 'Haircut' },
      { id: 103, name: 'Classic Executive Scissor Haircut', price: 400, duration: 35, cat: 'Haircut' },
      { id: 104, name: 'Haircut + Beard Sculpting Combo', price: 500, duration: 45, cat: 'Combo' },
      { id: 105, name: 'Beard Trim & Hot Towel Shave', price: 200, duration: 20, cat: 'Beard' },
      { id: 106, name: 'Luxury Scalp Detox & Head Spa', price: 650, duration: 40, cat: 'Spa' }
    ],
    stylists: [
      { id: 1, name: 'Raj Malhotra', role: 'Master Stylist', rating: 4.9 },
      { id: 2, name: 'Amit Verma', role: 'Senior Barber & Fade Specialist', rating: 4.8 },
      { id: 3, name: 'Priya Kapoor', role: 'Hair Specialist & Colorist', rating: 4.9 }
    ]
  },
  {
    id: 2,
    name: 'Atelier Éthéré Luxury Sanctuary',
    distance: '1.4 km away',
    rating: 4.95,
    reviews: 210,
    address: '18 Rue de Haute, Galleria Arcade',
    chairsAvailable: 2,
    estWait: '~25 mins',
    image: '🌸',
    badge: 'Haute Beauté',
    services: [
      { id: 201, name: 'Signature Precision Haircut & Styling', price: 450, duration: 35, cat: 'Haircut' },
      { id: 202, name: 'Rose Petal Hydration Facial & Haircut', price: 850, duration: 60, cat: 'Combo' },
      { id: 203, name: 'Japanese Scalp Detox & Head Spa', price: 750, duration: 45, cat: 'Spa' }
    ],
    stylists: [
      { id: 4, name: 'Camille Laurent', role: 'Master Aesthetician', rating: 5.0 },
      { id: 5, name: 'Elena Vance', role: 'Master Hair Colorist', rating: 4.9 }
    ]
  },
  {
    id: 3,
    name: 'The Urban Barber & Grooming Club',
    distance: '2.1 km away',
    rating: 4.8,
    reviews: 180,
    address: '77 Heritage Boulevard, 2nd Floor',
    chairsAvailable: 1,
    estWait: '~30 mins',
    image: '🧔',
    badge: 'Traditional Shaves',
    services: [
      { id: 301, name: 'Vintage Barber Haircut & Clean Neck Shave', price: 320, duration: 30, cat: 'Haircut' },
      { id: 302, name: 'Royal Hot Towel Shave & Beard Trim', price: 220, duration: 25, cat: 'Beard' },
      { id: 303, name: 'Full Grooming Overhaul (Hair + Beard + Pack)', price: 650, duration: 55, cat: 'Combo' }
    ],
    stylists: [
      { id: 6, name: 'Kenji Sato', role: 'Grooming Master', rating: 4.9 },
      { id: 7, name: 'Sophie Chen', role: 'Stylist & Detailer', rating: 4.8 }
    ]
  }
];

