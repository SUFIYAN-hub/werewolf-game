import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

function PrayerNotification({ location }) {
  const [nextPrayer, setNextPrayer] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [timeUntilPrayer, setTimeUntilPrayer] = useState('');

  useEffect(() => {
    // Simplified prayer times calculation
    // In production, use a proper Islamic prayer times library like 'adhan'
    const calculatePrayerTimes = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Approximate prayer times (should be calculated based on location and date)
      const prayers = [
        { name: 'Fajr', hour: 5, minute: 0, emoji: '🌅' },
        { name: 'Dhuhr', hour: 12, minute: 30, emoji: '☀️' },
        { name: 'Asr', hour: 16, minute: 0, emoji: '🌤️' },
        { name: 'Maghrib', hour: 18, minute: 30, emoji: '🌆' },
        { name: 'Isha', hour: 20, minute: 0, emoji: '🌙' }
      ];

      // Find next prayer
      let next = null;
      for (let prayer of prayers) {
        const prayerTime = prayer.hour * 60 + prayer.minute;
        const currentTime = currentHour * 60 + currentMinute;
        
        if (prayerTime > currentTime) {
          next = prayer;
          break;
        }
      }

      // If no prayer found today, next is Fajr tomorrow
      if (!next) {
        next = prayers[0];
      }

      setNextPrayer(next);

      // Calculate time until prayer
      const prayerDateTime = new Date();
      prayerDateTime.setHours(next.hour, next.minute, 0, 0);
      
      if (prayerDateTime < now) {
        prayerDateTime.setDate(prayerDateTime.getDate() + 1);
      }

      const diff = prayerDateTime - now;
      const minutesUntil = Math.floor(diff / 60000);
      const hoursUntil = Math.floor(minutesUntil / 60);
      const minsRemaining = minutesUntil % 60;

      if (hoursUntil > 0) {
        setTimeUntilPrayer(`${hoursUntil}h ${minsRemaining}m`);
      } else {
        setTimeUntilPrayer(`${minsRemaining}m`);
      }

      // Show notification 10 minutes before prayer
      if (minutesUntil <= 10 && minutesUntil > 0) {
        setShowNotification(true);
      }

      // Show notification during prayer time (within 20 minutes window)
      if (minutesUntil === 0) {
        setShowNotification(true);
      }
    };

    calculatePrayerTimes();
    const interval = setInterval(calculatePrayerTimes, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [location]);

  if (!nextPrayer) return null;

  return (
  <>
    {/* Prayer Time Indicator (Always visible) - Responsive */}
    <div className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-green-900/80 backdrop-blur-md text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg border border-green-500/50 z-50">
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
        <div className="text-xs">
          <p className="font-semibold text-xs sm:text-sm">
            <span className="hidden sm:inline">Next: </span>{nextPrayer.name} {nextPrayer.emoji}
          </p>
          <p className="text-green-200 text-xs">
            <span className="hidden sm:inline">in </span>{timeUntilPrayer}
          </p>
        </div>
      </div>
    </div>

    {/* Prayer Time Notification (Shows 10 min before) - Responsive */}
    {showNotification && (
      <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-2xl border-2 border-green-400 z-50 max-w-xs sm:max-w-md mx-2 animate-bounce">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="text-2xl sm:text-3xl">{nextPrayer.emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold text-sm sm:text-lg">{nextPrayer.name} Prayer Time!</h3>
            <p className="text-xs sm:text-sm text-green-100">
              {timeUntilPrayer === '0m' 
                ? 'Time to pray now!' 
                : `Prepare - ${timeUntilPrayer} left`}
            </p>
            <p className="text-xs text-green-200 mt-1 hidden sm:block">
              Game will auto-pause during prayer
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