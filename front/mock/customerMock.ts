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

export interface HaircutStyle {
  id: number;
  salonId: number;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'UNISEX' | string;
  price: number;
  durationMinutes: number;
  duration?: number;
  description?: string;
  imageUrl?: string;
  cat?: string;
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
  tokenNumber?: string;
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
  tokenNumber?: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  serviceName?: string;
  service?: string;
  durationMinutes?: number;
  staffName: string;
  position: number;
  peopleAhead?: number;
  estimatedWaitMinutes: number;
  status: QueueStatus | string;
  joinedAt: string;
}

export interface QueueTicketItem {
  queueId: number;
  appointmentId: number;
  tokenNumber: string;
  customerName: string;
  service: string;
  staffName: string;
  position?: number;
  estimatedWaitMinutes?: number;
  status: string;
}

export interface NextAvailableQueueInfo {
  ongoingToken: string;
  ongoingCustomerName?: string;
  ongoingStylistName?: string;
  totalServing: number;
  totalWaiting: number;
  nextAvailableToken: string;
  nextQueuePosition: number;
  estimatedWaitMinutesForNext: number;
  currentlyServing: QueueTicketItem[];
  waitingQueue: QueueTicketItem[];
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
    id: 1,
    name: "Raj Malhotra",
    role: "Master Stylist & Hair Specialist",
    rating: 4.9,
    status: "AVAILABLE"
  },
  {
    id: 2,
    name: "Alex Rivera",
    role: "Senior Barber & Fade Master",
    rating: 4.9,
    status: "AVAILABLE"
  },
  {
    id: 3,
    name: "Amit Verma",
    role: "Senior Barber & Stylist",
    rating: 4.8,
    status: "AVAILABLE"
  },
  {
    id: 4,
    name: "Priya Kapoor",
    role: "Skin & Spa Specialist",
    rating: 4.9,
    status: "BUSY"
  }
];

// Live Queue & Next Available Token state (matching GET /api/queue/next-available)
export const defaultMockQueueInfo: NextAvailableQueueInfo = {
  ongoingToken: "T-001",
  ongoingCustomerName: "Rahul Sharma",
  ongoingStylistName: "Alex Rivera",
  totalServing: 1,
  totalWaiting: 2,
  nextAvailableToken: "T-003",
  nextQueuePosition: 3,
  estimatedWaitMinutesForNext: 35,
  currentlyServing: [
    {
      queueId: 1,
      appointmentId: 1,
      tokenNumber: "T-001",
      customerName: "Rahul Sharma",
      service: "Classic Fade Haircut",
      staffName: "Alex Rivera",
      status: "SERVING"
    }
  ],
  waitingQueue: [
    {
      queueId: 2,
      appointmentId: 2,
      tokenNumber: "T-002",
      customerName: "Amit Verma",
      service: "Beard Trim",
      staffName: "Alex Rivera",
      position: 1,
      estimatedWaitMinutes: 15,
      status: "WAITING"
    }
  ]
};

// Active Queue state for customer
export const initialMockQueue: CustomerQueueStatus = {
  queueId: 3,
  appointmentId: 3,
  tokenNumber: "T-003",
  customerId: 1,
  customerName: "Rahul Sharma",
  customerPhone: "9876543210",
  serviceName: "Classic Fade Haircut",
  service: "Classic Fade Haircut",
  durationMinutes: 30,
  staffName: "Alex Rivera",
  position: 3,
  peopleAhead: 2,
  estimatedWaitMinutes: 35,
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
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  operatingTimings?: string;
  salonType?: string;
  pincode?: string;
  status?: string;
  chairsAvailable: number;
  estWait: string;
  image?: string;
  iconType?: 'scissors' | 'sparkles' | 'crown';
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
    address: '42 MG Road, Indiranagar, Bangalore 560001',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    phone: '+91 98765 43210',
    operatingTimings: '09:00 AM - 09:00 PM',
    salonType: 'UNISEX',
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
    address: '18 Linking Road, Bandra West, Mumbai 400050',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    phone: '+91 91234 56789',
    operatingTimings: '10:00 AM - 08:30 PM',
    salonType: 'FEMALE',
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
    address: '77 Koregaon Park Main Rd, Pune 411001',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '+91 98123 45678',
    operatingTimings: '08:30 AM - 09:30 PM',
    salonType: 'MALE',
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

export const mockHaircutStyles: HaircutStyle[] = [
  {
    id: 1,
    salonId: 1,
    name: 'Classic Fade Haircut',
    gender: 'MALE',
    price: 350.0,
    durationMinutes: 30,
    duration: 30,
    cat: 'Men',
    description: 'Clean skin fade or taper cut styled with premium pomade.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500'
  },
  {
    id: 2,
    salonId: 1,
    name: 'Layered Bob Cut',
    gender: 'FEMALE',
    price: 600.0,
    durationMinutes: 45,
    duration: 45,
    cat: 'Women',
    description: 'Textured layered bob cut with blow-dry styling.',
    imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500'
  },
  {
    id: 3,
    salonId: 1,
    name: 'Textured Crop & Low Taper Fade',
    gender: 'MALE',
    price: 320.0,
    durationMinutes: 30,
    duration: 30,
    cat: 'Men',
    description: 'Modern textured top fringe with precision fade lines and matte paste.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500'
  },
  {
    id: 4,
    salonId: 1,
    name: 'Luxe Butterfly Cut & Blowout',
    gender: 'FEMALE',
    price: 850.0,
    durationMinutes: 50,
    duration: 50,
    cat: 'Women',
    description: 'Cascading butterfly layers with weightless volume and thermal blowout styling.',
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500'
  },
  {
    id: 5,
    salonId: 1,
    name: 'Executive Scissor Cut & Hot Towel',
    gender: 'MALE',
    price: 400.0,
    durationMinutes: 35,
    duration: 35,
    cat: 'Men',
    description: 'Traditional scissor-over-comb bespoke haircut finished with refreshing eucalyptus hot towel.',
    imageUrl: 'https://images.unsplash.com/photo-1517832606589-7629c3395907?w=500'
  },
  {
    id: 6,
    salonId: 1,
    name: 'Keratin Smooth & Precision Trim',
    gender: 'UNISEX',
    price: 750.0,
    durationMinutes: 45,
    duration: 45,
    cat: 'Unisex',
    description: 'Deep nourishing keratin smoothing therapy with split-end seal precision trim.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'
  }
];

