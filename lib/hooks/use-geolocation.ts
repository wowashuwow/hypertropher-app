import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  userLocation: { lat: number; lng: number } | null;
  locationPermissionGranted: boolean;
  locationPermissionRequested: boolean;
  locationError: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    userLocation: null,
    locationPermissionGranted: false,
    locationPermissionRequested: false,
    locationError: null,
    loading: false,
  });

  const requestLocationPermission = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        locationError: 'Geolocation is not supported by this browser.',
        locationPermissionRequested: true,
        loading: false,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      locationError: null,
    }));

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setState(prev => ({
          ...prev,
          userLocation: location,
          locationPermissionGranted: true,
          locationPermissionRequested: true,
          loading: false,
          locationError: null,
        }));
      },
      (error) => {
        let errorMessage = 'Unable to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. We\'ll search restaurants in your selected city instead.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An error occurred while retrieving your location.';
            break;
        }

        setState(prev => ({
          ...prev,
          userLocation: null,
          locationPermissionGranted: false,
          locationPermissionRequested: true,
          loading: false,
          locationError: errorMessage,
        }));
      },
      geolocationOptions
    );
  }, []);

  // Check if geolocation is supported
  const checkGeolocationSupport = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return 'geolocation' in navigator;
  }, []);

  // Check actual browser permission status and restore cached data
  useEffect(() => {
    const checkPermissionStatus = async () => {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        return;
      }

      // First, restore cached permission status
      const cachedLocation = localStorage.getItem('userLocation');
      const lastUpdated = localStorage.getItem('locationLastUpdated');
      const permissionGranted = localStorage.getItem('locationPermissionGranted');
      const permissionRequested = localStorage.getItem('locationPermissionRequested');
      
      console.log('🔍 Checking cached location data:', {
        hasCachedLocation: !!cachedLocation,
        hasPermissionStatus: !!permissionGranted,
        permissionGranted: permissionGranted === 'true',
        permissionRequested: permissionRequested === 'true'
      });

      // Try to query actual browser permission status
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('🌐 Actual browser permission status:', result.state);
          
          // Update state based on actual browser permission
          const isPermissionGranted = result.state === 'granted';
          setState(prev => ({
            ...prev,
            locationPermissionGranted: isPermissionGranted,
            locationPermissionRequested: result.state === 'granted' || result.state === 'denied',
          }));

          // If permission is granted but we don't have location yet, try to get it
          if (isPermissionGranted) {
            const hasCachedLocation = cachedLocation && lastUpdated && 
              (Date.now() - parseInt(lastUpdated)) < 300000;
            
            if (!hasCachedLocation) {
              console.log('📍 Permission granted but no recent location cache, fetching location...');
              // Get current position since permission is already granted
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  setState(prev => ({
                    ...prev,
                    userLocation: location,
                    loading: false,
                  }));
                  console.log('✅ Auto-fetched location after permission check:', location);
                },
                (error) => {
                  console.warn('⚠️ Failed to get location despite permission:', error);
                  setState(prev => ({
                    ...prev,
                    loading: false,
                  }));
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 60000, // Accept location up to 1 minute old
                }
              );
            }
          }
          
          // If permission is denied, clear cached location
          if (result.state === 'denied') {
            localStorage.removeItem('userLocation');
            localStorage.removeItem('locationLastUpdated');
          }
          
          // Set up permission status change listener
          result.addEventListener('change', () => {
            console.log('🔄 Permission status changed to:', result.state);
            setState(prev => ({
              ...prev,
              locationPermissionGranted: result.state === 'granted',
              locationPermissionRequested: result.state !== 'prompt',
              userLocation: result.state === 'granted' ? prev.userLocation : null,
            }));
            
            localStorage.setItem('locationPermissionGranted', (result.state === 'granted').toString());
            localStorage.setItem('locationPermissionRequested', (result.state !== 'prompt').toString());
          });
        }
      } catch (error) {
        console.warn('⚠️ Could not query geolocation permission:', error);
        
        // Fallback to cached values
        if (permissionGranted === 'true' || permissionRequested === 'true') {
          setState(prev => ({
            ...prev,
            locationPermissionGranted: permissionGranted === 'true',
            locationPermissionRequested: permissionRequested === 'true',
          }));
        }
      }
      
      // Use cached location if available and not too old, and permission is granted
      if (cachedLocation && lastUpdated && permissionGranted === 'true') {
        const age = Date.now() - parseInt(lastUpdated);
        if (age < 300000) {
          try {
            const location = JSON.parse(cachedLocation);
            setState(prev => ({
              ...prev,
              userLocation: location,
              locationPermissionGranted: true,
            }));
            console.log('✅ Restored cached location:', location);
          } catch (error) {
            console.error('Failed to parse cached location:', error);
          }
        } else {
          console.log('⏰ Cached location expired, removing from storage');
          localStorage.removeItem('userLocation');
          localStorage.removeItem('locationLastUpdated');
        }
      }
    };
    
    checkPermissionStatus();
  }, []);

  // Save location and permission status to localStorage when updated
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Save permission status regardless of location
    localStorage.setItem('locationPermissionGranted', state.locationPermissionGranted.toString());
    localStorage.setItem('locationPermissionRequested', state.locationPermissionRequested.toString());
    
    // Save location if available
    if (state.userLocation && state.locationPermissionGranted) {
      localStorage.setItem('userLocation', JSON.stringify(state.userLocation));
      localStorage.setItem('locationLastUpdated', Date.now().toString());
      console.log('💾 Saved location data to localStorage');
    }
  }, [state.userLocation, state.locationPermissionGranted, state.locationPermissionRequested]);

  return {
    ...state,
    requestLocationPermission,
    checkGeolocationSupport: checkGeolocationSupport(),
  };
};
