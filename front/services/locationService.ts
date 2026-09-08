export interface DetectedLocation {
  city: string;
  area: string;
  formatted: string;
  latitude?: number;
  longitude?: number;
  source: 'gps' | 'ip' | 'manual';
}

// Known coordinates for major Indian hubs for offline/fallback proximity matching
const KNOWN_METROS: { name: string; area: string; lat: number; lng: number }[] = [
  { name: 'Mumbai', area: 'Bandra West', lat: 19.0760, lng: 72.8777 },
  { name: 'Pune', area: 'Koregaon Park', lat: 18.5204, lng: 73.8567 },
  { name: 'Bengaluru', area: 'Indiranagar', lat: 12.9716, lng: 77.5946 },
  { name: 'Delhi NCR', area: 'Connaught Place', lat: 28.6139, lng: 77.2090 },
  { name: 'Hyderabad', area: 'Jubilee Hills', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', area: 'Nungambakkam', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', area: 'Park Street', lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad', area: 'Bodakdev', lat: 23.0225, lng: 72.5714 },
  { name: 'Chandigarh', area: 'Sector 17', lat: 30.7333, lng: 76.7794 },
  { name: 'Jaipur', area: 'C-Scheme', lat: 26.9124, lng: 75.7873 },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const locationService = {
  getStoredLocation(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('salonpulse_user_location');
  },

  setStoredLocation(loc: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('salonpulse_user_location', loc);
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<DetectedLocation> {
    // 1. Try BigDataCloud free client reverse geocoding
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Mumbai';
        const area = data.locality || data.localityInfo?.administrative?.[3]?.name || 'Metro Area';
        const formatted = area && area !== city ? `${area}, ${city}` : city;
        return {
          city,
          area,
          formatted,
          latitude,
          longitude,
          source: 'gps'
        };
      }
    } catch {
      // Continue to next fallback
    }

    // 2. Try OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
          signal: AbortSignal.timeout(5000)
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.state_district ||
          addr.state ||
          'Mumbai';
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
        const formatted = area ? `${area}, ${city}` : city;
        return {
          city,
          area: area || city,
          formatted,
          latitude,
          longitude,
          source: 'gps'
        };
      }
    } catch {
      // Continue to next fallback
    }

    // 3. Proximity lookup against known metros
    let closest = KNOWN_METROS[0];
    let minDistance = Infinity;
    for (const metro of KNOWN_METROS) {
      const dist = calculateDistanceKm(latitude, longitude, metro.lat, metro.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = metro;
      }
    }

    const formatted = minDistance < 120 ? `${closest.area}, ${closest.name}` : `${closest.name}`;
    return {
      city: closest.name,
      area: closest.area,
      formatted,
      latitude,
      longitude,
      source: 'gps'
    };
  },

  async detectRealTimeLocation(): Promise<DetectedLocation> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const detected = await locationService.reverseGeocode(latitude, longitude);
            locationService.setStoredLocation(detected.formatted);
            resolve(detected);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          let errorMsg = 'Failed to get location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission was denied by user.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Location request timed out.';
          }
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  // Fallback to IP-based location if user denied browser GPS
  async detectLocationFromIp(): Promise<DetectedLocation> {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const city = data.city || 'Mumbai';
        const region = data.region || 'Maharashtra';
        const formatted = `${city}, ${region}`;
        locationService.setStoredLocation(formatted);
        return {
          city,
          area: region,
          formatted,
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip'
        };
      }
    } catch {
      // Fallback default
    }
    const def = {
      city: 'Mumbai',
      area: 'Bandra West',
      formatted: 'Bandra West, Mumbai',
      source: 'manual' as const
    };
    locationService.setStoredLocation(def.formatted);
    return def;
  }
};
