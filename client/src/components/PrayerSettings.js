import React, { useState } from 'react';
import { Settings, X, Check, MapPin, Book, Calculator } from 'lucide-react';
import Button from './Button';
import { 
  CALCULATION_METHODS, 
  MADHABS,
  savePrayerSettings,
  getSavedPrayerSettings 
} from '../services/prayerTimesService';

function PrayerSettings({ isOpen, onClose, currentLocation, onSettingsChange, onChangeLocation }) {
  const savedSettings = getSavedPrayerSettings();
  const [selectedMethod, setSelectedMethod] = useState(savedSettings.method || 'KARACHI');
  const [selectedMadhab, setSelectedMadhab] = useState(savedSettings.madhab || 'HANAFI');

  const handleSave = () => {
    const newSettings = {
      method: selectedMethod,
      madhab: selectedMadhab,
      notifications: true
    };
    
    savePrayerSettings(newSettings);
    onSettingsChange(newSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-6 max-w-lg w-full border-2 border-green-500/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500/20 p-2 rounded-full">
              <Settings className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Prayer Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Islamic Reminder */}
        <div className="bg-green-950/50 border border-green-500/30 rounded-lg p-3 mb-6">
          <p className="text-green-100 text-xs text-center">
            "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"
            <br />
            <span className="text-green-200">
              "Verily, prayer is prescribed at specific times" (Quran 4:103)
            </span>
          </p>
        </div>

        {/* Current Location */}
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white text-sm font-semibold">Current Location</p>
                <p className="text-green-200 text-xs">
                  {currentLocation?.displayName || currentLocation?.city || 'Not Set'}
                </p>
              </div>
            </div>
            <button
              onClick={onChangeLocation}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
            >
              Change
            </button>
          </div>
        </div>

        {/* Calculation Method Selection */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Calculator className="w-5 h-5 text-green-400" />
            <label className="text-white font-semibold">Calculation Method</label>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {Object.entries(CALCULATION_METHODS).map(([key, method]) => (
              <button
                key={key}
                onClick={() => setSelectedMethod(key)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedMethod === key
                    ? 'bg-green-600 border-green-400 shadow-lg'
                    : 'bg-white/10 border-green-500/30 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{method.name}</p>
                    <p className="text-green-200 text-xs">
                      Used in: {method.regions.join(', ')}
                    </p>
                  </div>
                  {selectedMethod === key && (
                    <Check className="w-5 h-5 text-white flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Recommended Method Info */}
          {currentLocation?.country && (
            <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-yellow-200 text-xs">
                💡 <strong>Recommended for {currentLocation.country}:</strong> {
                  CALCULATION_METHODS[
                    Object.keys(CALCULATION_METHODS).find(key => 
                      CALCULATION_METHODS[key].regions.some(region => 
                        currentLocation.country.toLowerCase().includes(region.toLowerCase())
                      )
                    ) || 'KARACHI'
                  ].name
                }
              </p>
            </div>
          )}
        </div>

        {/* Madhab Selection */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Book className="w-5 h-5 text-green-400" />
            <label className="text-white font-semibold">
              Madhab (Fiqh School for Asr)
            </label>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-3">
            <p className="text-blue-200 text-xs">
              ℹ️ <strong>Note:</strong> Madhab selection affects Asr prayer time calculation.
              <br />
              • <strong>Hanafi:</strong> Asr starts when shadow = 2x object length (later time)
              <br />
              • <strong>Shafi'i/Maliki/Hanbali:</strong> Asr starts when shadow = 1x object length (earlier time)
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedMadhab('HANAFI')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedMadhab === 'HANAFI'
                  ? 'bg-green-600 border-green-400 shadow-lg'
                  : 'bg-white/10 border-green-500/30 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Hanafi</p>
                  <p className="text-green-200 text-xs">
                    Later Asr time (shadow = 2x object length)
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    ✅ Recommended for Ahle Sunnat Wal Jamaat (South Asia)
                  </p>
                </div>
                {selectedMadhab === 'HANAFI' && (
                  <Check className="w-6 h-6 text-white flex-shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedMadhab('SHAFI')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedMadhab === 'SHAFI'
                  ? 'bg-green-600 border-green-400 shadow-lg'
                  : 'bg-white/10 border-green-500/30 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Shafi'i / Maliki / Hanbali</p>
                  <p className="text-green-200 text-xs">
                    Earlier Asr time (shadow = 1x object length)
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    Standard method used in Middle East, Southeast Asia
                  </p>
                </div>
                {selectedMadhab === 'SHAFI' && (
                  <Check className="w-6 h-6 text-white flex-shrink-0" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="success"
            fullWidth
            icon={Check}
          >
            Save Settings
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-green-500/30">
          <p className="text-green-200 text-xs text-center">
            🕌 Settings are saved locally on your device
            <br />
            Prayer times will be recalculated based on your preferences
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrayerSettings;