import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState({
    country: null,
    countryCode: null,
    city: null,
    latitude: null,
    longitude: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        // First try to get location from browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              try {
                // Use reverse geocoding to get country info
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  setLocation({
                    country: data.countryName,
                    countryCode: data.countryCode,
                    city: data.city,
                    latitude,
                    longitude,
                    loading: false,
                    error: null
                  });
                } else {
                  // Fallback to IP-based location
                  await getLocationByIP();
                }
              } catch (error) {
                console.log('Reverse geocoding failed, trying IP-based location');
                await getLocationByIP();
              }
            },
            (error) => {
              console.log('Geolocation failed, trying IP-based location');
              getLocationByIP();
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        } else {
          // Fallback to IP-based location
          await getLocationByIP();
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Location detection failed'
        }));
      }
    };

    const getLocationByIP = async () => {
      try {
        const response = await fetch('https://api.ipapi.com/api/check?access_key=free');
        if (response.ok) {
          const data = await response.json();
          setLocation({
            country: data.country_name,
            countryCode: data.country_code,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            loading: false,
            error: null
          });
        } else {
          // Final fallback - use a default location
          setLocation({
            country: 'Kenya',
            countryCode: 'KE',
            city: 'Nairobi',
            latitude: -1.2921,
            longitude: 36.8219,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('IP-based location failed:', error);
        // Final fallback - use a default location
        setLocation({
          country: 'Kenya',
          countryCode: 'KE',
          city: 'Nairobi',
          latitude: -1.2921,
          longitude: 36.8219,
          loading: false,
          error: null
        });
      }
    };

    getLocation();
  }, []);

  return location;
};
