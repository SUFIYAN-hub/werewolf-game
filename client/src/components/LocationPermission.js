import React, { useState } from 'react';
import { MapPin, Search, Loader2, AlertCircle, Check } from 'lucide-react';
import Button from './Button';
import { getUserLocation, getCityFromCoordinates, saveLocation, searchCityCoordinates } from '../services/locationService';

function LocationPermission({ onLocationSet }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualSearch, setManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleAutoDetect = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get coordinates
      const coords = await getUserLocation();
      
      // Get city name from coordinates
      const cityInfo = await getCityFromCoordinates(coords.latitude, coords.longitude);
      
      const locationData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: cityInfo.city,
        country: cityInfo.country,
        displayName: cityInfo.displayName,
        method: 'auto'
      };
      
      // Save to localStorage
      saveLocation(locationData);
      
      // Pass to parent
      onLocationSet(locationData);
      
    } catch (err) {
      console.error('Location error:', err);
      if (err.code === 1) {
        setError('Location permission denied. Please allow location access or enter manually.');
      } else if (err.code === 2) {
        setError('Location unavailable. Please enter your city manually.');
      } else if (err.code === 3) {
        setError('Location request timeout. Please try again or enter manually.');
      } else {
        setError('Could not get your location. Please enter manually.');
      }
      setManualSearch(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a city name');
      return;
    }
    
    setSearching(true);
    setError('');
    
    try {
      const results = await searchCityCoordinates(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('City not found. Please try another name.');
      }
    } catch (err) {
      setError('Could not find city. Please check spelling and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = (result) => {
    const locationData = {
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.city,
      country: result.country,
      displayName: result.displayName,
      method: 'manual'
    };
    
    // Save to localStorage
    saveLocation(locationData);
    
    // Pass to parent
    onLocationSet(locationData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-8 max-w-md w-full border-2 border-green-500/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/20 p-4 rounded-full">
              <MapPin className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Set Your Location</h2>
          <p className="text-green-200 text-sm">
            We need your location to show accurate prayer times
          </p>
        </div>

        {/* Islamic Reminder */}
        <div className="bg-green-950/50 border border-green-500/30 rounded-lg p-4 mb-6">
          <p className="text-green-100 text-xs text-center">
            "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"
            <br />
            <span className="text-green-200">
              Prayer is prescribed at specific times (Quran 4:103)
            </span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Auto-detect Section */}
        {!manualSearch && (
          <div className="space-y-4">
            <Button
              onClick={handleAutoDetect}
              loading={loading}
              variant="success"
              size="lg"
              fullWidth
              icon={!loading ? MapPin : undefined}
            >
              {loading ? 'Detecting Location...' : 'Auto-Detect Location'}
            </Button>

            <div className="text-center">
              <button
                onClick={() => setManualSearch(true)}
                className="text-green-300 hover:text-green-100 text-sm underline"
              >
                Or enter city manually
              </button>
            </div>
          </div>
        )}

        {/* Manual Search Section */}
        {manualSearch && (
          <div className="space-y-4">
            <div>
              <label className="block text-green-200 mb-2 text-sm">
                Enter Your City
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="e.g., Mumbai, India"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-green-300/50 border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button
                  onClick={handleManualSearch}
                  loading={searching}
                  variant="success"
                  icon={!searching ? Search : undefined}
                >
                  {searching ? '' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-green-200 text-sm font-semibold">Select your city:</p>
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectCity(result)}
                    className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-green-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white text-sm">{result.displayName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  setManualSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                  setError('');
                }}
                className="text-green-300 hover:text-green-100 text-sm underline"
              >
                Back to auto-detect
              </button>
            </div>
          </div>
        )}

        {/* Why We Need This */}
        <div className="mt-6 pt-6 border-t border-green-500/30">
          <p className="text-green-200 text-xs text-center">
            🔒 Your location is only used for prayer time calculations.
            <br />
            We never share or store it on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LocationPermission;