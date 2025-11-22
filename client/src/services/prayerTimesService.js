import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Qibla } from 'adhan';

// Available calculation methods
export const CALCULATION_METHODS = {
  MWL: {
    name: 'Muslim World League',
    method: CalculationMethod.MuslimWorldLeague(),
    regions: ['Europe', 'Americas', 'Far East']
  },
  ISNA: {
    name: 'Islamic Society of North America',
    method: CalculationMethod.NorthAmerica(),
    regions: ['North America']
  },
  EGYPT: {
    name: 'Egyptian General Authority',
    method: CalculationMethod.Egyptian(),
    regions: ['Egypt', 'Middle East']
  },
  UMM_AL_QURA: {
    name: 'Umm Al-Qura University (Makkah)',
    method: CalculationMethod.UmmAlQura(),
    regions: ['Saudi Arabia', 'Gulf']
  },
  KARACHI: {
    name: 'University of Islamic Sciences, Karachi',
    method: CalculationMethod.Karachi(),
    regions: ['Pakistan', 'Bangladesh', 'India', 'Afghanistan']
  },
  DUBAI: {
    name: 'Dubai',
    method: CalculationMethod.Dubai(),
    regions: ['UAE']
  },
  QATAR: {
    name: 'Qatar',
    method: CalculationMethod.Qatar(),
    regions: ['Qatar']
  },
  KUWAIT: {
    name: 'Kuwait',
    method: CalculationMethod.Kuwait(),
    regions: ['Kuwait']
  },
  MOONSIGHTING: {
    name: 'Moonsighting Committee Worldwide',
    method: CalculationMethod.MoonsightingCommittee(),
    regions: ['Global']
  },
  SINGAPORE: {
    name: 'Singapore',
    method: CalculationMethod.Singapore(),
    regions: ['Singapore', 'Malaysia']
  }
};

// Madhab for Asr calculation
export const MADHABS = {
  SHAFI: 'Shafi', // Standard (shadow length = object + its shadow)
  HANAFI: 'Hanafi' // Later time (shadow length = 2 * object + its shadow)
};

// Get recommended calculation method based on country
export const getRecommendedMethod = (country) => {
  const countryLower = country.toLowerCase();
  
  if (countryLower.includes('saudi') || countryLower.includes('makkah') || countryLower.includes('mecca')) {
    return 'UMM_AL_QURA';
  } else if (countryLower.includes('egypt')) {
    return 'EGYPT';
  } else if (countryLower.includes('pakistan') || countryLower.includes('india') || countryLower.includes('bangladesh')) {
    return 'KARACHI';
  } else if (countryLower.includes('uae') || countryLower.includes('dubai')) {
    return 'DUBAI';
  } else if (countryLower.includes('qatar')) {
    return 'QATAR';
  } else if (countryLower.includes('kuwait')) {
    return 'KUWAIT';
  } else if (countryLower.includes('singapore') || countryLower.includes('malaysia')) {
    return 'SINGAPORE';
  } else if (countryLower.includes('usa') || countryLower.includes('canada') || countryLower.includes('america')) {
    return 'ISNA';
  } else {
    return 'MWL'; // Default: Muslim World League
  }
};

// Calculate prayer times
export const calculatePrayerTimes = (latitude, longitude, date = new Date(), methodKey = 'MWL', madhab = 'SHAFI') => {
  try {
    // Create coordinates
    const coordinates = new Coordinates(latitude, longitude);
    
    // Get calculation method
    const params = CALCULATION_METHODS[methodKey].method;
    
    // Set madhab (for Asr calculation)
    if (madhab === 'HANAFI') {
      params.madhab = 'hanafi';
    } else {
      params.madhab = 'shafi';
    }
    
    // Calculate prayer times
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    // Get all prayer times
    const times = {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      
      // Additional info
      date: date,
      coordinates: { latitude, longitude },
      method: CALCULATION_METHODS[methodKey].name,
      madhab: madhab
    };
    
    return times;
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    return null;
  }
};

// Get current prayer
export const getCurrentPrayer = (prayerTimes) => {
  if (!prayerTimes) return null;
  
  const now = new Date();
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr, emoji: '🌅' },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, emoji: '☀️' },
    { name: 'Asr', time: prayerTimes.asr, emoji: '🌤️' },
    { name: 'Maghrib', time: prayerTimes.maghrib, emoji: '🌆' },
    { name: 'Isha', time: prayerTimes.isha, emoji: '🌙' }
  ];
  
  // Find current prayer (last prayer that has passed)
  let current = null;
  for (let i = prayers.length - 1; i >= 0; i--) {
    if (now >= prayers[i].time) {
      current = prayers[i];
      break;
    }
  }
  
  // If before Fajr, current prayer is Isha from yesterday
  if (!current) {
    current = prayers[prayers.length - 1];
  }
  
  return current;
};

// Get next prayer
export const getNextPrayer = (prayerTimes) => {
  if (!prayerTimes) return null;
  
  const now = new Date();
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr, emoji: '🌅' },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, emoji: '☀️' },
    { name: 'Asr', time: prayerTimes.asr, emoji: '🌤️' },
    { name: 'Maghrib', time: prayerTimes.maghrib, emoji: '🌆' },
    { name: 'Isha', time: prayerTimes.isha, emoji: '🌙' }
  ];
  
  // Find next prayer
  for (let prayer of prayers) {
    if (now < prayer.time) {
      return prayer;
    }
  }
  
  // If after Isha, next prayer is Fajr tomorrow
  // Calculate tomorrow's Fajr
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = calculatePrayerTimes(
    prayerTimes.coordinates.latitude,
    prayerTimes.coordinates.longitude,
    tomorrow
  );
  
  return {
    name: 'Fajr',
    time: tomorrowTimes.fajr,
    emoji: '🌅'
  };
};

// Get time remaining until prayer
export const getTimeUntilPrayer = (prayerTime) => {
  const now = new Date();
  const diff = prayerTime - now;
  
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    total: diff,
    formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  };
};

// Check if it's prayer time (within notification window)
export const isPrayerTime = (prayerTime, windowMinutes = 15) => {
  const now = new Date();
  const diff = prayerTime - now;
  const diffMinutes = diff / (1000 * 60);
  
  // Check if within window before prayer or within 5 minutes after
  return diffMinutes >= 0 && diffMinutes <= windowMinutes;
};

// Format time for display
export const formatPrayerTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format time in 24-hour format
export const formatPrayerTime24 = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Calculate Qibla direction
export const calculateQibla = (latitude, longitude) => {
  const coordinates = new Coordinates(latitude, longitude);
  const qiblaDirection = Qibla(coordinates);
  return qiblaDirection; // Returns direction in degrees
};

// Save prayer time settings
export const savePrayerSettings = (settings) => {
  try {
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving prayer settings:', error);
  }
};

// Get saved prayer time settings
export const getSavedPrayerSettings = () => {
  try {
    const saved = localStorage.getItem('prayerSettings');
    return saved ? JSON.parse(saved) : {
      method: 'MWL',
      madhab: 'SHAFI',
      notifications: true
    };
  } catch (error) {
    console.error('Error getting prayer settings:', error);
    return {
      method: 'MWL',
      madhab: 'SHAFI',
      notifications: true
    };
  }
};