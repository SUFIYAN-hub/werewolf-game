// Get user's geolocation coordinates
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Get city name from coordinates (reverse geocoding)
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    );
    const data = await response.json();
    
    const city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 data.address.state || 
                 'Unknown';
    
    const country = data.address.country || 'Unknown';
    
    return {
      city,
      country,
      displayName: `${city}, ${country}`
    };
  } catch (error) {
    console.error('Error getting city name:', error);
    return {
      city: 'Unknown',
      country: 'Unknown',
      displayName: 'Unknown Location'
    };
  }
};

// Save location to localStorage
export const saveLocation = (locationData) => {
  try {
    localStorage.setItem('userLocation', JSON.stringify(locationData));
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

// Get saved location from localStorage
export const getSavedLocation = () => {
  try {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error getting saved location:', error);
    return null;
  }
};

// Search for city coordinates (manual entry)
export const searchCityCoordinates = async (cityName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=5`
    );
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('City not found');
    }
    
    return data.map(result => ({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      city: result.name,
      country: result.address?.country || ''
    }));
  } catch (error) {
    console.error('Error searching city:', error);
    throw error;
  }
};