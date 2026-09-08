'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Clock,
  Users,
  ShieldCheck,
  Scissors,
  Sparkles,
  Crown,
  Navigation,
  X,
  Zap,
  FastForward,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Banknote,
  Loader2,
  SearchX,
  Filter,
  Check
} from 'lucide-react';
import { ThemeProvider, useTheme } from '../../components/customer/ThemeContext';
import Navbar from '../../components/customer/Navbar';
import MobileNavigation from '../../components/customer/MobileNavigation';
import { customerService } from '../../services/customerService';
import { locationService } from '../../services/locationService';
import {
  CustomerUser,
  CustomerQueueStatus,
  CustomerAppointment,
  mockCustomer
} from '../../mock/customerMock';

interface SalonLocation {
  id: number;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  address: string;
  chairsAvailable: number;
  estWait: string;
  iconType: 'scissors' | 'sparkles' | 'crown';
  badge?: string;
  services: { id: number; name: string; price: number; duration: number; cat: string }[];
  stylists: { id: number; name: string; role: string; rating: number }[];
}

function CustomerHomeContent() {
  const { isLight } = useTheme();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [queue, setQueue] = useState<CustomerQueueStatus | null>(null);
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [userLocation, setUserLocation] = useState<string>('Downtown, Metro Area');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoSimulatedPos, setDemoSimulatedPos] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-Time Location Permission Popup State
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [isLocatingRealTime, setIsLocatingRealTime] = useState(false);
  const [locationResultStatus, setLocationResultStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);
  const [locErrorMessage, setLocErrorMessage] = useState<string | null>(null);

  // Booking Modal State
  const [selectedSalon, setSelectedSalon] = useState<SalonLocation | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1); // 1: Haircut type, 2: Timing & Stylist, 3: Details, 4: Payment
  const [selectedHaircut, setSelectedHaircut] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedStylist, setSelectedStylist] = useState('Raj Malhotra');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  useEffect(() => {
    let currentUser = customerService.getCurrentUser();
    if (!currentUser) {
      currentUser = mockCustomer;
    }
    setUser(currentUser);
    setCustomerName(currentUser.name);
    setCustomerPhone(currentUser.phone || currentUser.mobileNumber || '');

    customerService.getQueueStatus(currentUser.id).then(setQueue);
    customerService.getAppointments(currentUser.id).then(setAppointments);

    // Check if user has previously saved location
    const storedLoc = locationService.getStoredLocation();
    if (storedLoc) {
      setUserLocation(storedLoc);
    }

    // Show Real-Time Location Popup when user visits the home page
    const hasPrompted = sessionStorage.getItem('salonpulse_home_location_prompted');
    if (!hasPrompted) {
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllowRealTimeLocation = async () => {
    setIsLocatingRealTime(true);
    setLocationResultStatus('detecting');
    setLocErrorMessage(null);
    try {
      const detected = await locationService.detectRealTimeLocation();
      setDetectedLocationName(detected.formatted);
      setUserLocation(detected.formatted);
      locationService.setStoredLocation(detected.formatted);
      setLocationResultStatus('success');
      sessionStorage.setItem('salonpulse_home_location_prompted', 'true');
      setToastMessage(`📍 Real-time location active: ${detected.formatted}`);
      setTimeout(() => {
        setShowLocationPopup(false);
        setIsLocatingRealTime(false);
      }, 1000);
    } catch (err: any) {
      // If browser GPS is denied, fallback automatically to IP geolocation
      try {
        const ipLoc = await locationService.detectLocationFromIp();
        setDetectedLocationName(ipLoc.formatted);
        setUserLocation(ipLoc.formatted);
        locationService.setStoredLocation(ipLoc.formatted);
        setLocationResultStatus('success');
        sessionStorage.setItem('salonpulse_home_location_prompted', 'true');
        setToastMessage(`📍 Real-time location active: ${ipLoc.formatted}`);
        setTimeout(() => {
          setShowLocationPopup(false);
          setIsLocatingRealTime(false);
        }, 1000);
      } catch {
        setLocationResultStatus('error');
        setLocErrorMessage(err?.message || 'Location permission was denied. Please pick your city below:');
        setIsLocatingRealTime(false);
      }
    }
  };

  const handleSelectCityManually = (cityName: string) => {
    setUserLocation(cityName);
    locationService.setStoredLocation(cityName);
    sessionStorage.setItem('salonpulse_home_location_prompted', 'true');
    setToastMessage(`📍 Location set to: ${cityName}`);
    setShowLocationPopup(false);
  };

  const handleDetectLocation = async () => {
    setToastMessage('Detecting your real-time coordinates (GPS)...');
    try {
      const detected = await locationService.detectRealTimeLocation();
      setUserLocation(detected.formatted);
      locationService.setStoredLocation(detected.formatted);
      setToastMessage(`📍 Location detected: ${detected.formatted}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      try {
        const ipLoc = await locationService.detectLocationFromIp();
        setUserLocation(ipLoc.formatted);
        locationService.setStoredLocation(ipLoc.formatted);
        setToastMessage(`📍 Location detected: ${ipLoc.formatted}`);
        setTimeout(() => setToastMessage(null), 4000);
      } catch {
        setShowLocationPopup(true);
      }
    }
  };

  const handleSimulateTurn = () => {
    const current = demoSimulatedPos ?? (queue ? queue.position : 3);
    if (current > 1) {
      const next = current - 1;
      setDemoSimulatedPos(next);
      if (next === 1) {
        setToastMessage('🔔 Ding! Your token is NOW SERVING at Chair 2 with Raj Malhotra!');
      } else {
        setToastMessage(`✨ Real-time update: Position #${next} (~${next * 10} mins wait remaining).`);
      }
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setDemoSimulatedPos(3);
      setToastMessage('🔄 Demo queue reset to Token #3.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const getDynamicSalons = (location: string): SalonLocation[] => {
    const locLower = location.toLowerCase();
    const isMumbai = locLower.includes('mumbai');
    const isDelhi = locLower.includes('delhi') || locLower.includes('gurgaon') || locLower.includes('noida');
    const isBlr = locLower.includes('bengaluru') || locLower.includes('bangalore') || locLower.includes('indiranagar');

    if (isMumbai) {
      return [
        {
          id: 1,
          name: 'SalonPulse Bandra Studio',
          distance: '0.6 km away',
          rating: 4.9,
          reviews: 340,
          address: '42 Linking Road, Bandra West, Mumbai',
          chairsAvailable: 3,
          estWait: '~15 mins',
          iconType: 'scissors',
          badge: 'Nearest • Verified Partner',
          services: [
            { id: 101, name: 'Signature Precision Haircut & Styling', price: 350, duration: 30, cat: 'Haircut' },
            { id: 102, name: 'Fade & Textured Crop Style', price: 300, duration: 25, cat: 'Haircut' },
            { id: 103, name: 'Classic Executive Scissor Haircut', price: 400, duration: 35, cat: 'Haircut' },
            { id: 104, name: 'Haircut + Beard Sculpting Combo', price: 500, duration: 45, cat: 'Combo' },
            { id: 105, name: 'Beard Trim & Hot Towel Shave', price: 200, duration: 20, cat: 'Beard' }
          ],
          stylists: [
            { id: 1, name: 'Raj Malhotra', role: 'Master Stylist', rating: 4.9 },
            { id: 2, name: 'Amit Verma', role: 'Senior Barber', rating: 4.8 },
            { id: 3, name: 'Priya Kapoor', role: 'Hair Specialist', rating: 4.9 }
          ]
        },
        {
          id: 2,
          name: 'Atelier Éthéré Luxury Sanctuary',
          distance: '1.2 km away',
          rating: 4.95,
          reviews: 210,
          address: '18 Juhu Tara Road, Juhu Beach Promenade, Mumbai',
          chairsAvailable: 2,
          estWait: '~25 mins',
          iconType: 'sparkles',
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
          distance: '2.4 km away',
          rating: 4.8,
          reviews: 180,
          address: '77 Colaba Causeway, Next to Regal, South Mumbai',
          chairsAvailable: 1,
          estWait: '~30 mins',
          iconType: 'crown',
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
    }

    if (isDelhi) {
      return [
        {
          id: 1,
          name: 'SalonPulse Connaught Studio',
          distance: '0.7 km away',
          rating: 4.9,
          reviews: 320,
          address: 'Block B, Inner Circle, Connaught Place, New Delhi',
          chairsAvailable: 3,
          estWait: '~15 mins',
          iconType: 'scissors',
          badge: 'Nearest • Verified Partner',
          services: [
            { id: 101, name: 'Signature Precision Haircut & Styling', price: 350, duration: 30, cat: 'Haircut' },
            { id: 102, name: 'Fade & Textured Crop Style', price: 300, duration: 25, cat: 'Haircut' },
            { id: 103, name: 'Classic Executive Scissor Haircut', price: 400, duration: 35, cat: 'Haircut' },
            { id: 104, name: 'Haircut + Beard Sculpting Combo', price: 500, duration: 45, cat: 'Combo' },
            { id: 105, name: 'Beard Trim & Hot Towel Shave', price: 200, duration: 20, cat: 'Beard' }
          ],
          stylists: [
            { id: 1, name: 'Raj Malhotra', role: 'Master Stylist', rating: 4.9 },
            { id: 2, name: 'Amit Verma', role: 'Senior Barber', rating: 4.8 },
            { id: 3, name: 'Priya Kapoor', role: 'Hair Specialist', rating: 4.9 }
          ]
        },
        {
          id: 2,
          name: 'Atelier Éthéré Luxury Sanctuary',
          distance: '1.5 km away',
          rating: 4.95,
          reviews: 240,
          address: 'Two Horizon Center, Golf Course Road, Gurgaon',
          chairsAvailable: 2,
          estWait: '~20 mins',
          iconType: 'sparkles',
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
          distance: '2.2 km away',
          rating: 4.8,
          reviews: 190,
          address: 'Hauz Khas Village Main Lane, South Delhi',
          chairsAvailable: 1,
          estWait: '~35 mins',
          iconType: 'crown',
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
    }

    // Default or Bengaluru or other custom city
    const cityTitle = location.split(',')[0].trim() || 'Downtown';
    return [
      {
        id: 1,
        name: `SalonPulse ${isBlr ? 'Downtown' : cityTitle} Studio`,
        distance: '0.8 km away',
        rating: 4.9,
        reviews: 340,
        address: isBlr ? '42 MG Road, Indiranagar, Bengaluru' : `42 Main Promenade, ${location}`,
        chairsAvailable: 3,
        estWait: '~15 mins',
        iconType: 'scissors',
        badge: 'Nearest • Verified Partner',
        services: [
          { id: 101, name: 'Signature Precision Haircut & Styling', price: 350, duration: 30, cat: 'Haircut' },
          { id: 102, name: 'Fade & Textured Crop Style', price: 300, duration: 25, cat: 'Haircut' },
          { id: 103, name: 'Classic Executive Scissor Haircut', price: 400, duration: 35, cat: 'Haircut' },
          { id: 104, name: 'Haircut + Beard Sculpting Combo', price: 500, duration: 45, cat: 'Combo' },
          { id: 105, name: 'Beard Trim & Hot Towel Shave', price: 200, duration: 20, cat: 'Beard' }
        ],
        stylists: [
          { id: 1, name: 'Raj Malhotra', role: 'Master Stylist', rating: 4.9 },
          { id: 2, name: 'Amit Verma', role: 'Senior Barber', rating: 4.8 },
          { id: 3, name: 'Priya Kapoor', role: 'Hair Specialist', rating: 4.9 }
        ]
      },
      {
        id: 2,
        name: 'Atelier Éthéré Luxury Sanctuary',
        distance: '1.4 km away',
        rating: 4.95,
        reviews: 210,
        address: isBlr ? '18 Lavelle Road, Central Bengaluru' : `18 Haute Arcade, ${location}`,
        chairsAvailable: 2,
        estWait: '~25 mins',
        iconType: 'sparkles',
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
        address: isBlr ? '77 Koramangala 4th Block, Bengaluru' : `77 Heritage Boulevard, ${location}`,
        chairsAvailable: 1,
        estWait: '~30 mins',
        iconType: 'crown',
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
  };

  const nearbySalons = getDynamicSalons(userLocation);

  const renderSalonIcon = (iconType: 'scissors' | 'sparkles' | 'crown') => {
    switch (iconType) {
      case 'sparkles':
        return (
          <div className="relative group/icon">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a02f5d] via-[#d45d88] to-[#6d1b3c] p-[2px] shadow-lg shadow-rose-950/25 ring-2 ring-rose-400/30 flex items-center justify-center transition-transform group-hover/icon:scale-105">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#912450] via-[#ab3163] to-[#591530] flex items-center justify-center relative overflow-hidden">
                {/* Glossy ambient flare */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-200/30 blur-xs pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-rose-400/20 blur-sm pointer-events-none" />
                {/* Elegant Luxury Spa & Beauty Sparkle Crest */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-rose-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]" fill="currentColor">
                  {/* Central Sparkle Star */}
                  <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="url(#roseSparkle)" />
                  {/* Secondary Diamond Sparkle */}
                  <path d="M18.5 3L19.3 5.7L22 6.5L19.3 7.3L18.5 10L17.7 7.3L15 6.5L17.7 5.7L18.5 3Z" fill="#fed7aa" opacity="0.9" />
                  {/* Tertiary Sparkle */}
                  <path d="M6 15L6.6 17.4L9 18L6.6 18.6L6 21L5.4 18.6L3 18L5.4 17.4L6 15Z" fill="#fed7aa" opacity="0.8" />
                  <defs>
                    <linearGradient id="roseSparkle" x1="4" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.6" stopColor="#fed7aa" />
                      <stop offset="1" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-white shadow-sm">
              ✦
            </span>
          </div>
        );
      case 'crown':
        return (
          <div className="relative group/icon">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#78350f] p-[2px] shadow-lg shadow-amber-950/40 ring-2 ring-amber-400/40 flex items-center justify-center transition-transform group-hover/icon:scale-105">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#262320] via-[#1c1917] to-[#0c0a09] flex items-center justify-center relative overflow-hidden">
                {/* Gold rim ambient flare */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400/30 blur-xs pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-amber-600/20 blur-sm pointer-events-none" />
                {/* Heritage Barber Crown & Blade Crest */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-400 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Royal Crown */}
                  <path d="M4 18h16l-2-10-5 6-3-9-3 9-5-6-2 10z" fill="url(#goldCrown)" stroke="#fbbf24" />
                  <circle cx="12" cy="5" r="1.2" fill="#fbbf24" stroke="none" />
                  <circle cx="6" cy="8" r="1" fill="#fbbf24" stroke="none" />
                  <circle cx="18" cy="8" r="1" fill="#fbbf24" stroke="none" />
                  {/* Pedestal Base */}
                  <path d="M6 21h12" stroke="#fbbf24" strokeWidth="2" />
                  <defs>
                    <linearGradient id="goldCrown" x1="4" y1="8" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fef3c7" />
                      <stop offset="0.5" stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-slate-950 shadow-sm">
              ★
            </span>
          </div>
        );
      case 'scissors':
      default:
        return (
          <div className="relative group/icon">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#b35d3d] via-[#8c4a32] to-[#4e1f0e] p-[2px] shadow-lg shadow-[#8c4a32]/35 ring-2 ring-[#8c4a32]/40 flex items-center justify-center transition-transform group-hover/icon:scale-105">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#8c4a32] via-[#75341d] to-[#441a0b] flex items-center justify-center relative overflow-hidden">
                {/* Copper sheen flare */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-200/30 blur-xs pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-amber-500/20 blur-sm pointer-events-none" />
                {/* Precision Salon Shears & Styling Crest */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="6" r="3" fill="#fef3c7" fillOpacity="0.25" stroke="#fef3c7" />
                  <path d="M8.12 8.12 12 12" stroke="#fef3c7" strokeWidth="2.2" />
                  <path d="M20 4 8.12 15.88" stroke="#fef3c7" strokeWidth="2.2" />
                  <circle cx="6" cy="18" r="3" fill="#fef3c7" fillOpacity="0.25" stroke="#fef3c7" />
                  <path d="M14.8 14.8 20 20" stroke="#fef3c7" strokeWidth="2.2" />
                  {/* Center Pivot Gem */}
                  <circle cx="12" cy="12" r="1.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                </svg>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#8c4a32] to-[#5c2715] border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-amber-200 shadow-sm">
              ✓
            </span>
          </div>
        );
    }
  };

  const availableTimeSlots = [
    '10:30 AM', '11:15 AM', '12:00 PM', '01:30 PM', '02:45 PM', '04:00 PM', '05:30 PM', '06:45 PM'
  ];

  const isSearching = searchQuery.trim().length > 0;

  const filteredSalons = nearbySalons.filter((s) => {
    if (!isSearching) return true;
    const q = searchQuery.trim().toLowerCase();
    const matchName = s.name.toLowerCase().includes(q);
    const matchAddress = s.address.toLowerCase().includes(q);
    const matchService = s.services.some((srv) => srv.name.toLowerCase().includes(q));
    return matchName || matchAddress || matchService;
  });

  // Open booking modal
  const handleStartBooking = (salon: SalonLocation) => {
    setSelectedSalon(salon);
    setSelectedHaircut(salon.services[0]);
    setSelectedStylist(salon.stylists[0].name);
    setBookingStep(1);
    setPaymentSuccessData(null);
  };

  // Complete Dummy Payment
  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate payment gateway delay

    const newAptId = 100 + appointments.length + 1;
    const newQueueToken = 3;

    const newAppointment: CustomerAppointment = {
      id: newAptId,
      serviceId: selectedHaircut.id,
      serviceName: selectedHaircut.name,
      staffId: 101,
      staffName: selectedStylist,
      appointmentTime: selectedTimeSlot,
      appointmentDate: selectedDate,
      price: selectedHaircut.price,
      status: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      refundStatus: 'NOT_REQUESTED',
      queuePosition: newQueueToken,
      estimatedWaitMinutes: 20
    };

    const updatedApts = [newAppointment, ...appointments];
    setAppointments(updatedApts);

    // Save to service
    const newQueueStatus: CustomerQueueStatus = {
      queueId: 300 + newAptId,
      appointmentId: newAptId,
      customerId: user ? user.id : 1,
      customerName: customerName,
      serviceName: selectedHaircut.name,
      staffName: selectedStylist,
      position: newQueueToken,
      peopleAhead: 2,
      estimatedWaitMinutes: 20,
      status: 'WAITING',
      joinedAt: selectedTimeSlot
    };
    setQueue(newQueueStatus);

    setPaymentSuccessData({
      appointmentId: newAptId,
      queueToken: newQueueToken,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      salonName: selectedSalon?.name,
      serviceName: selectedHaircut.name,
      price: selectedHaircut.price,
      time: selectedTimeSlot,
      stylist: selectedStylist,
      paymentMethod: paymentMethod.toUpperCase()
    });

    setIsProcessingPayment(false);
    setToastMessage(`Payment Successful! Your Queue Token is #${newQueueToken}`);
  };

  const currentToken = demoSimulatedPos ?? (queue ? queue.position : 3);
  const isServing = currentToken === 1;
  const activeAppointment = appointments.find(a => a.status === 'CONFIRMED');

  return (
    <div
      className={`min-h-screen transition-colors font-sans pb-16 md:pb-0 ${
        isLight ? 'bg-[#fff8f4] text-[#1e1b18]' : 'bg-[#0B0F17] text-slate-100'
      }`}
    >
      <Navbar userLocation={userLocation} onChangeLocation={setUserLocation} userName={user?.name} />

      {/* ======================================================== */}
      {/* REAL-TIME LOCATION PERMISSION POPUP MODAL */}
      {/* ======================================================== */}
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border relative overflow-hidden transition-all ${
              isLight
                ? 'bg-[#fff8f4] border-[#d9c2ba] text-[#1e1b18]'
                : 'bg-[#121826] border-slate-800 text-slate-100'
            }`}
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#8c4a32] to-amber-400"></div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('salonpulse_home_location_prompted', 'true');
                setShowLocationPopup(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
              title="Skip"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Radar beacon icon */}
              <div className="relative mb-4 mt-2">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                  {locationResultStatus === 'detecting' ? (
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-amber-400 opacity-50"></span>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8c4a32] to-[#6f331d] text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Loader2 className="w-7 h-7 animate-spin text-amber-300" />
                      </div>
                    </div>
                  ) : locationResultStatus === 'success' ? (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Check className="w-7 h-7 stroke-[2.8]" />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-14 w-14 rounded-full bg-amber-400 opacity-25"></span>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8c4a32] to-[#6f331d] text-white flex items-center justify-center shadow-lg shadow-[#8c4a32]/25">
                        <Navigation className="w-7 h-7 text-amber-300 stroke-[2.2]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Header Title */}
              <h3 className={`text-2xl font-black tracking-tight ${
                isLight ? 'text-[#6f331d] font-serif' : 'text-white'
              }`}>
                {locationResultStatus === 'success'
                  ? `Located in ${detectedLocationName || userLocation}!`
                  : 'Enable Real-Time Location'}
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm opacity-75 mt-2 max-w-sm leading-relaxed">
                {locationResultStatus === 'detecting'
                  ? 'Accessing real-time device GPS & reverse-geocoding your live city...'
                  : locationResultStatus === 'success'
                  ? `Your real-time location has been detected as ${detectedLocationName}. Loading live salons, stylists & wait times...`
                  : 'Allow SalonPulse to access your location to show live waiting queues, open chairs, and elite salons in your city (e.g. Mumbai, Bengaluru).'}
              </p>

              {/* Action Buttons */}
              {locationResultStatus !== 'success' && (
                <div className="w-full mt-6 space-y-3.5">
                  <button
                    type="button"
                    disabled={isLocatingRealTime}
                    onClick={handleAllowRealTimeLocation}
                    className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                      isLocatingRealTime
                        ? 'opacity-80 cursor-wait'
                        : 'hover:scale-[1.02] active:scale-[0.98]'
                    } ${
                      isLight
                        ? 'bg-gradient-to-r from-[#6f331d] to-[#8c4a32] text-white shadow-[#8c4a32]/25'
                        : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/30'
                    }`}
                  >
                    {isLocatingRealTime ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Detecting Real-Time Coordinates...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 stroke-[2.4]" />
                        <span>Allow Real-Time Location</span>
                      </>
                    )}
                  </button>

                  {locErrorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left">
                      {locErrorMessage}
                    </div>
                  )}

                  {/* Manual Quick Metros */}
                  <div className="pt-2 border-t border-inherit text-left w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-2">
                      Or select your city directly:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai'].map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleSelectCityManually(city)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            userLocation.toLowerCase().includes(city.toLowerCase())
                              ? isLight
                                ? 'bg-[#6f331d] text-white border-[#6f331d]'
                                : 'bg-amber-500 text-slate-950 border-amber-500'
                              : isLight
                              ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#53433e] hover:bg-[#ebdcd6]'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
                          }`}
                        >
                          📍 {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('salonpulse_home_location_prompted', 'true');
                      setShowLocationPopup(false);
                    }}
                    className="text-xs opacity-60 hover:opacity-100 transition-opacity underline block mx-auto pt-1"
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold animate-bounce bg-[#121826] border-amber-500 text-amber-300">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ======================================================== */}
        {/* 1. LOCATION & SALON SEARCH HERO BANNER */}
        {/* ======================================================== */}
        <section
          className={`rounded-3xl p-6 sm:p-10 border relative overflow-hidden shadow-xl ${
            isLight
              ? 'bg-gradient-to-br from-[#f4ece7] via-[#fff8f4] to-[#f4ece7] border-[#d9c2ba]'
              : 'bg-gradient-to-br from-[#121826] via-[#0e1420] to-[#0B0F17] border-slate-800'
          }`}
        >
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Salon Discovery</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-[#6f331d] font-serif' : 'text-white'
            }`}>
              Find & Book Salons in Real-Time
            </h1>

            <p className={`text-sm sm:text-base max-w-2xl ${
              isLight ? 'text-[#53433e]' : 'text-slate-300'
            }`}>
              Search top-rated salons by name, choose haircut styles, pick your timing, and book with instant queue placement.
            </p>

            {/* Interactive Search Bar & Quick Filters */}
            <div className="pt-2 flex flex-col gap-3 max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search salon name (e.g. SalonPulse, Atelier, Urban Barber)..."
                    className={`w-full pl-10 pr-10 py-3.5 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-none transition-all ${
                      isLight
                        ? 'bg-white border-[#d9c2ba] text-[#1e1b18] placeholder:text-slate-400 focus:border-[#8c4a32] shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-400 shadow-xs'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className={`px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                    isLight
                      ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Detect Location</span>
                </button>
              </div>

              {/* Quick Salon Name Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-semibold opacity-70 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter by salon:
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                    !searchQuery
                      ? isLight ? 'bg-[#6f331d] text-white border-[#6f331d]' : 'bg-amber-500 text-slate-950 border-amber-500'
                      : isLight ? 'bg-white border-[#d9c2ba] text-[#53433e] hover:border-[#8c4a32]' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  All Salons
                </button>
                {nearbySalons.map((s) => {
                  const isSelected = searchQuery.toLowerCase() === s.name.toLowerCase();
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSearchQuery(s.name)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                        isSelected
                          ? isLight ? 'bg-[#6f331d] text-white border-[#6f331d]' : 'bg-amber-500 text-slate-950 border-amber-500'
                          : isLight ? 'bg-white border-[#d9c2ba] text-[#53433e] hover:border-[#8c4a32]' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. ACTIVE BOOKING & LIVE QUEUE STRIP (Hidden when searching) */}
        {/* ======================================================== */}
        {!isSearching && activeAppointment && (
          <section
            className={`rounded-2xl p-6 border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                isLight ? 'bg-[#ffdbce] text-[#6f331d]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                #{currentToken}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Active Booking • Live Queue
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isServing ? 'bg-blue-500 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {isServing ? 'Now Serving' : 'Waiting in Line'}
                  </span>
                </div>

                <h2 className="text-lg font-bold mt-0.5">
                  {activeAppointment.serviceName}
                </h2>

                <p className="text-xs opacity-75 mt-0.5">
                  Stylist: <strong>{activeAppointment.staffName}</strong> • {activeAppointment.appointmentDate} at {activeAppointment.appointmentTime} • Chair 2
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right mr-2 hidden sm:block">
                <div className="text-[10px] uppercase font-bold opacity-60">Estimated Wait</div>
                <div className={`text-base font-extrabold ${isLight ? 'text-[#8c4a32]' : 'text-emerald-400'}`}>
                  {isServing ? '0 mins' : `~${currentToken * 10} mins`}
                </div>
              </div>

              <Link
                href="/customer/queue"
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                  isLight ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                Track Live Queue (#{currentToken}) →
              </Link>

              <button
                onClick={handleSimulateTurn}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                  isLight ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#6f331d]' : 'border-slate-700 hover:bg-slate-800 text-purple-300'
                }`}
                title="Simulate queue turn advancement"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Advance</span>
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 3. SEARCHED SALONS & BOOKING OPTIONS */}
        {/* ======================================================== */}
        <section id="salons" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  isLight ? 'text-[#6f331d] font-serif' : 'text-white'
                }`}>
                  {isSearching ? `Matching Salon: "${searchQuery}"` : `Nearby Salons in ${userLocation.split(',')[0]}`}
                </h2>
                {isSearching && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    Active Filter
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75 mt-0.5">
                {isSearching
                  ? `Displaying only the matching salon card${filteredSalons.length === 1 ? '' : 's'} based on your search.`
                  : 'Click "Book Appointment Now" on any salon card to choose your haircut, slot & pay'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                    isLight
                      ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#6f331d]'
                      : 'border-slate-700 hover:bg-slate-800 text-amber-400'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Show All Salons</span>
                </button>
              )}
              <span className="text-xs font-bold text-amber-500">
                {filteredSalons.length} Salon{filteredSalons.length === 1 ? '' : 's'} Available
              </span>
            </div>
          </div>

          {filteredSalons.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center ${
              isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
            }`}>
              <SearchX className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold">No salons found matching &quot;{searchQuery}&quot;</h3>
              <p className="text-xs opacity-70 mt-1 max-w-sm mx-auto">
                Try searching for &quot;SalonPulse&quot;, &quot;Atelier&quot;, or &quot;Urban Barber&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`mt-5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm ${
                  isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                Clear Search & View All Salons
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              filteredSalons.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : filteredSalons.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-1 md:grid-cols-3'
            }`}>
              {filteredSalons.map((salon) => (
                <div
                  key={salon.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group ${
                    isLight
                      ? 'bg-white border-[#e9e1dc] hover:border-[#8c4a32]/60'
                      : 'bg-[#121826] border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  {/* Subtle top ambient sheen on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    {/* Header: Luxury Salon Icon + Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {renderSalonIcon(salon.iconType)}
                      {salon.badge && (
                        <span className={`text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border shrink-0 ${
                          isLight
                            ? 'bg-[#ffede6] text-[#6f331d] border-[#6f331d]/20'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{salon.badge}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-extrabold leading-snug tracking-tight">
                      {salon.name}
                    </h3>

                    {/* Ratings & Distance */}
                    <div className="flex items-center gap-2 text-xs font-bold mt-2">
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/25">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{salon.rating}</span>
                      </span>
                      <span className="opacity-60 font-normal">({salon.reviews} reviews)</span>
                      <span className="opacity-40">•</span>
                      <span className="text-emerald-500 font-semibold">{salon.distance}</span>
                    </div>

                    {/* Address with MapPin */}
                    <p className="text-xs opacity-75 mt-2.5 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-[#8c4a32] dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{salon.address}</span>
                    </p>

                    {/* Live Status Indicators (Chairs & Queue) */}
                    <div className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
                      isLight ? 'bg-[#f7f1ee] border-[#ebdcd6]' : 'bg-slate-950/70 border-slate-800/80'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-black tracking-wider opacity-60">Chairs Available</div>
                          <div className="font-extrabold text-emerald-500 text-xs">{salon.chairsAvailable} Open Now</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-right">
                        <div>
                          <div className="text-[9px] uppercase font-black tracking-wider opacity-60">Queue Wait</div>
                          <div className="font-extrabold text-xs">{salon.estWait}</div>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Available Services Chips */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {salon.services.slice(0, 3).map((srv) => (
                        <span key={srv.id} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-500/10 font-semibold opacity-85">
                          {srv.name.split(' ')[0]} (₹{srv.price})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="mt-6 pt-4 border-t border-inherit flex items-center gap-2">
                    <Link
                      href={`/customer/book?salonId=${salon.id}`}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-xs text-center transition-all shadow-md flex items-center justify-center gap-2 group/btn ${
                        isLight
                          ? 'bg-gradient-to-r from-[#6f331d] to-[#8c4a32] hover:from-[#8c4a32] hover:to-[#a04e33] text-white shadow-[#8c4a32]/20'
                          : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      <Calendar className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      <span>Book Appointment Now</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 4. HOW IT WORKS / HOW TO USE (Hidden when searching) */}
        {/* ======================================================== */}
        {!isSearching && (
          <section
            className={`rounded-3xl p-8 border shadow-lg ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba]'
                : 'bg-[#121826] border-slate-800'
            }`}
          >
            <div className="max-w-xl mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                Zero Waiting Rooms
              </span>
              <h2 className={`text-2xl font-bold tracking-tight mt-1 ${
                isLight ? 'text-[#6f331d] font-serif' : 'text-white'
              }`}>
                How to Use SalonPulse
              </h2>
              <p className="text-xs opacity-75 mt-1">
                Select your salon, choose your haircut, pick your slot, and pay dummy online:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'}`}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-bold text-sm">Select Nearby Salon & Haircut</h3>
                <p className="text-xs opacity-70 mt-1">
                  Pick your preferred salon, choose fade, classic cut, or beard styling.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'}`}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-bold text-sm">Choose Timing & Dummy Pay</h3>
                <p className="text-xs opacity-70 mt-1">
                  Select your time slot, enter details, and pay dummy mock payment via UPI or Card.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'}`}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-bold text-sm">Live Token Assigned (#3)</h3>
                <p className="text-xs opacity-70 mt-1">
                  Get your live token instantly. Walk in when Chair 2 is ready with zero queue waiting.
                </p>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ======================================================== */}
      {/* 5. MULTI-STEP BOOKING & DUMMY PAYMENT MODAL */}
      {/* ======================================================== */}
      {selectedSalon && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border relative my-8 ${
              isLight
                ? 'bg-[#fff8f4] border-[#d9c2ba] text-[#1e1b18]'
                : 'bg-[#121826] border-slate-800 text-slate-100'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-inherit">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  {selectedSalon.name}
                </span>
                <h3 className="text-xl font-bold">
                  {bookingStep === 1 && 'Step 1: Select Type of Haircut / Service'}
                  {bookingStep === 2 && 'Step 2: Select Appointment Timing & Stylist'}
                  {bookingStep === 3 && 'Step 3: Confirm Customer Details'}
                  {bookingStep === 4 && (paymentSuccessData ? 'Booking & Payment Confirmed!' : 'Step 4: Dummy Mock Payment')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSalon(null)}
                className="w-8 h-8 rounded-full border flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Pills */}
            {!paymentSuccessData && (
              <div className="flex items-center justify-between gap-2 py-4 text-xs font-bold border-b border-inherit">
                <span className={bookingStep >= 1 ? 'text-amber-500' : 'opacity-40'}>1. Haircut</span>
                <span>→</span>
                <span className={bookingStep >= 2 ? 'text-amber-500' : 'opacity-40'}>2. Timing</span>
                <span>→</span>
                <span className={bookingStep >= 3 ? 'text-amber-500' : 'opacity-40'}>3. Details</span>
                <span>→</span>
                <span className={bookingStep >= 4 ? 'text-amber-500' : 'opacity-40'}>4. Payment</span>
              </div>
            )}

            {/* STEP 1: SELECT TYPE OF HAIRCUT */}
            {bookingStep === 1 && (
              <div className="py-5 space-y-4">
                <div className="text-xs opacity-75">
                  Choose the haircut or grooming treatment you desire:
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {selectedSalon.services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedHaircut(srv)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedHaircut?.id === srv.id
                          ? isLight
                            ? 'bg-[#ffdbce] border-[#6f331d] shadow-sm'
                            : 'bg-amber-500/15 border-amber-500 text-white'
                          : isLight
                          ? 'bg-white border-[#e9e1dc] hover:border-[#8c4a32]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-500">
                          {srv.cat}
                        </span>
                        <div className="font-bold text-sm mt-0.5">{srv.name}</div>
                        <div className="text-xs opacity-60">{srv.duration} mins duration</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-amber-500">₹{srv.price}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedHaircut?.id === srv.id ? 'bg-amber-500 text-slate-950' : 'opacity-60'
                        }`}>
                          {selectedHaircut?.id === srv.id ? 'Selected ✓' : 'Select'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-inherit flex justify-end">
                  <button
                    onClick={() => setBookingStep(2)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                      isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Continue to Timing →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT TIMING & STYLIST */}
            {bookingStep === 2 && (
              <div className="py-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-70 mb-2">
                    Select Date
                  </label>
                  <div className="flex gap-2">
                    {['Today', 'Tomorrow', 'This Saturday'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedDate === d
                            ? isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                            : 'opacity-70 hover:opacity-100 border-inherit'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase opacity-70 mb-2">
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          selectedTimeSlot === slot
                            ? isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase opacity-70 mb-2">
                    Select Stylist / Barber
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedSalon.stylists.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStylist(st.name)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          selectedStylist === st.name
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs">{st.name}</div>
                        <div className="text-[10px] opacity-60">{st.role}</div>
                        <div className="text-[10px] text-amber-500 font-bold mt-1 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{st.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-inherit flex justify-between">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setBookingStep(3)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                      isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Enter Customer Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER DETAILS */}
            {bookingStep === 3 && (
              <div className="py-5 space-y-4">
                <div className="text-xs opacity-75">
                  Confirm your contact information for appointment SMS & token notifications:
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                        isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                      Phone Number (For Live Token SMS)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                        isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  </div>
                </div>

                {/* Booking Summary Box */}
                <div className={`p-4 rounded-2xl border text-xs space-y-2 mt-4 ${
                  isLight ? 'bg-[#f4ece7] border-[#d9c2ba]' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="font-bold text-sm mb-1 pb-1 border-b border-inherit">
                    Booking Summary
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Salon:</span>
                    <strong className="font-bold">{selectedSalon.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Haircut:</span>
                    <strong className="font-bold">{selectedHaircut?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Stylist:</span>
                    <strong>{selectedStylist}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Timing:</span>
                    <strong>{selectedDate} at {selectedTimeSlot}</strong>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-inherit">
                    <span>Total To Pay:</span>
                    <span className="text-amber-500">₹{selectedHaircut?.price}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-inherit flex justify-between">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setBookingStep(4)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                      isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DUMMY PAYMENT & CONFIRMATION */}
            {bookingStep === 4 && (
              <div className="py-5 space-y-4">
                {paymentSuccessData ? (
                  /* PAYMENT SUCCESS CARD */
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-3xl flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h4 className="text-2xl font-black">
                      Payment & Booking Confirmed!
                    </h4>

                    <p className="text-xs opacity-75 max-w-sm mx-auto">
                      Your appointment is booked at <strong>{paymentSuccessData.salonName}</strong> with token:
                    </p>

                    <div className={`p-5 rounded-2xl border inline-block min-w-[200px] shadow-lg ${
                      isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-950 border-amber-500/40'
                    }`}>
                      <div className="text-[10px] font-bold uppercase opacity-60">Live Queue Token</div>
                      <div className="text-5xl font-black text-amber-500 mt-1">
                        #{paymentSuccessData.queueToken}
                      </div>
                      <div className="text-xs font-semibold text-emerald-500 mt-1">
                        Chair 2 • ~20 mins wait
                      </div>
                    </div>

                    <div className="text-xs opacity-70">
                      Transaction Ref: <strong>{paymentSuccessData.transactionId}</strong> ({paymentSuccessData.paymentMethod})
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href="/customer/queue"
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs shadow-md ${
                          isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        Track Live Queue (#{paymentSuccessData.queueToken}) →
                      </Link>
                      <button
                        onClick={() => setSelectedSalon(null)}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl border text-xs font-bold opacity-75 hover:opacity-100"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MOCK PAYMENT SELECTION */
                  <div className="space-y-4">
                    <div className="text-xs opacity-75">
                      Select mock payment method (Simulation Mode):
                    </div>

                    <div className="space-y-2.5">
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'upi'
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">UPI / QR Code (GPay, PhonePe, Paytm)</div>
                            <div className="text-[11px] opacity-60">Instant mock payment confirmation</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">₹{selectedHaircut?.price}</span>
                      </div>

                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'card'
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">Credit / Debit Card</div>
                            <div className="text-[11px] opacity-60">Dummy Card ending in **** 4242</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">₹{selectedHaircut?.price}</span>
                      </div>

                      <div
                        onClick={() => setPaymentMethod('counter')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'counter'
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">Pay at Salon Counter</div>
                            <div className="text-[11px] opacity-60">Pay cash or card upon arrival</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">Pay Later</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-inherit flex justify-between items-center">
                      <button
                        onClick={() => setBookingStep(3)}
                        disabled={isProcessingPayment}
                        className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                      >
                        ← Back
                      </button>

                      <button
                        onClick={handleProcessPayment}
                        disabled={isProcessingPayment}
                        className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 ${
                          isLight
                            ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing Dummy Payment...</span>
                          </>
                        ) : (
                          <>
                            <span>Pay ₹{selectedHaircut?.price} & Enter Queue</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className={`border-t py-8 text-center text-xs opacity-60 ${
        isLight ? 'border-[#e9e1dc] bg-[#fff8f4]' : 'border-slate-900 bg-[#0B0F17]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 SalonPulse — Real-Time Salon Operations & Smart Queue.</span>
          <div className="flex gap-4">
            <Link href="/customer/appointments" className="hover:underline">Appointments</Link>
            <Link href="/customer/profile" className="hover:underline">My Profile</Link>
            <Link href="/customer/queue" className="hover:underline">Live Queue</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation with Professional Icons */}
      <MobileNavigation />
    </div>
  );
}

export default function CustomerHomePage() {
  return (
    <ThemeProvider>
      <CustomerHomeContent />
    </ThemeProvider>
  );
}
