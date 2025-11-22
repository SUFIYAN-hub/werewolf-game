import React, { useState, useEffect } from 'react';
import { Clock, X, MapPin, Settings } from 'lucide-react';
import { 
  calculatePrayerTimes, 
  getNextPrayer, 
  getTimeUntilPrayer,
  isPrayerTime,
  formatPrayerTime,
  getRecommendedMethod,
  getSavedPrayerSettings
} from '../services/prayerTimesService';
import { getSavedLocation } from '../services/locationService';

function PrayerNotification({ location }) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeUntilPrayer, setTimeUntilPrayer] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false);

  // Calculate prayer times when location changes
  useEffect(() => {
    const savedLocation = getSavedLocation();
    
    if (savedLocation?.latitude && savedLocation?.longitude) {
      const settings = getSavedPrayerSettings();
      
      // Get recommended method based on country
      const recommendedMethod = getRecommendedMethod(savedLocation.country || '');
      const method = settings.method || recommendedMethod;
      
      // Calculate prayer times
      const times = calculatePrayerTimes(
        savedLocation.latitude,
        savedLocation.longitude,
        new Date(),
        method,
        settings.madhab || 'SHAFI'
      );
      
      setPrayerTimes(times);
      
      // Get next prayer
      const next = getNextPrayer(times);
      setNextPrayer(next);
    }
  }, [location]);

  // Update countdown every second
  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      const remaining = getTimeUntilPrayer(nextPrayer.time);
      setTimeUntilPrayer(remaining.formatted);
      
      // Check if it's prayer time (within 10 minutes)
      if (isPrayerTime(nextPrayer.time, 10)) {
        setShowNotification(true);
      }
      
      // Check if it's exactly prayer time (within 1 minute)
      if (isPrayerTime(nextPrayer.time, 1)) {
        setShowNotification(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer]);

  // Recalculate at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    const timeout = setTimeout(() => {
      window.location.reload(); // Reload to recalculate
    }, msUntilMidnight);
    
    return () => clearTimeout(timeout);
  }, []);

  if (!prayerTimes || !nextPrayer) return null;

  const allPrayers = [
    { name: 'Fajr', time: prayerTimes.fajr, emoji: '🌅' },
    { name: 'Sunrise', time: prayerTimes.sunrise, emoji: '🌄' },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, emoji: '☀️' },
    { name: 'Asr', time: prayerTimes.asr, emoji: '🌤️' },
    { name: 'Maghrib', time: prayerTimes.maghrib, emoji: '🌆' },
    { name: 'Isha', time: prayerTimes.isha, emoji: '🌙' }
  ];

  return (
    <>
      {/* Prayer Time Indicator (Always visible) - Responsive */}
      <div 
        className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-green-900/90 backdrop-blur-md text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg border border-green-500/50 z-50 cursor-pointer hover:bg-green-800/90 transition-all"
        onClick={() => setShowAllTimes(!showAllTimes)}
      >
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <div className="text-xs">
            <p className="font-semibold text-xs sm:text-sm">
              <span className="hidden sm:inline">Next: </span>
              {nextPrayer.name} {nextPrayer.emoji}
            </p>
            <p className="text-green-200 text-xs">
              <span className="hidden sm:inline">in </span>
              {timeUntilPrayer}
            </p>
          </div>
        </div>
      </div>

      {/* All Prayer Times Popup */}
      {showAllTimes && (
        <div className="fixed top-16 sm:top-20 left-2 sm:left-4 bg-green-900/95 backdrop-blur-md text-white p-4 rounded-lg shadow-2xl border border-green-500/50 z-50 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Today's Prayer Times
            </h3>
            <button
              onClick={() => setShowAllTimes(false)}
              className="hover:bg-white/10 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {allPrayers.map((prayer, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded ${
                  prayer.name === nextPrayer.name && prayer.name !== 'Sunrise'
                    ? 'bg-yellow-500/30 border border-yellow-500'
                    : 'bg-white/10'
                }`}
              >
                <span className="text-sm">
                  {prayer.emoji} {prayer.name}
                </span>
                <span className="font-semibold text-sm">
                  {formatPrayerTime(prayer.time)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-green-200 border-t border-green-500/30 pt-2">
            <p>📍 {prayerTimes.coordinates.latitude.toFixed(2)}°, {prayerTimes.coordinates.longitude.toFixed(2)}°</p>
            <p>🕌 Method: {prayerTimes.method}</p>
            <p>📚 Madhab: {prayerTimes.madhab}</p>
          </div>
        </div>
      )}

      {/* Prayer Time Notification (Shows 10 min before) - Responsive */}
      {showNotification && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-2xl border-2 border-green-400 z-50 max-w-xs sm:max-w-md mx-2 animate-bounce">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-2xl sm:text-3xl">{nextPrayer.emoji}</div>
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-lg">{nextPrayer.name} Prayer Time!</h3>
              <p className="text-xs sm:text-sm text-green-100">
                {timeUntilPrayer === '0m' 
                  ? 'It\'s time to pray now! 🕌' 
                  : `Prepare yourself - ${timeUntilPrayer} remaining`}
              </p>
              <p className="text-xs text-green-200 mt-1 hidden sm:block">
                at {formatPrayerTime(nextPrayer.time)}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 hover:bg-green-700 p-1 sm:p-2 rounded-full transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Islamic Reminder - Responsive */}
      <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 bg-purple-900/80 backdrop-blur-md text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg border border-purple-500/50 z-40 max-w-xs">
        <p className="text-xs text-purple-200 hidden sm:block">
          "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"
        </p>
        <p className="text-xs text-purple-300 mt-1">
          <span className="hidden sm:inline">Prayer is prescribed at specific times</span>
          <span className="sm:hidden">🕌 Prayer reminder active</span>
        </p>
      </div>
    </>
  );
}

export default PrayerNotification;