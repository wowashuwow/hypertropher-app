import { useState, useEffect, useCallback } from 'react';

interface UseGooglePlacesOptions {
  userCity?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export interface RestaurantResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
}

export const useGooglePlaces = ({ userCity, userLocation }: UseGooglePlacesOptions) => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const initializeGoogleServices = () => {
      console.log('🔍 Checking Google Maps availability:', {
        google: !!window.google,
        maps: !!window.google?.maps,
        places: !!window.google?.maps?.places
      });

      if (window.google?.maps?.places) {
        console.log('✅ Google Maps Places API is available');
        setGoogleMapsLoaded(true);
        
        try {
          // Create PlacesService instance
          const mapElement = document.createElement('div');
          const map = new window.google.maps.Map(mapElement);
          const service = new window.google.maps.places.PlacesService(map);
          setPlacesService(service);

          // Create AutocompleteService instance
          const autocomplete = new window.google.maps.places.AutocompleteService();
          setAutocompleteService(autocomplete);

          console.log('✅ Google Places services initialized successfully');
          setLoading(false);
        } catch (error) {
          console.error('❌ Error initializing Google Places services:', error);
          setError('Failed to initialize Google Places services');
          setLoading(false);
        }
      } else {
        console.log('⏳ Google Maps Places API not ready yet, retrying...');
        // Retry after a short delay
        setTimeout(initializeGoogleServices, 100);
      }
    };

    initializeGoogleServices();
  }, []);

  // Search restaurants using Text Search API
  const searchRestaurants = useCallback(async (query: string): Promise<RestaurantResult[]> => {
    if (!placesService || !query.trim()) {
      return [];
    }

    return new Promise((resolve) => {
      const request: google.maps.places.TextSearchRequest = {
        query: query,
      };

      // Add location bias if user has granted location permission
      if (userLocation) {
        request.location = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
        request.radius = 5000; // 5km
      } else if (userCity) {
        // Fallback to city-based search without location bias
        request.query = `${query} ${userCity}`;
        request.radius = 50000; // 50km for city-wide search
      }

      placesService.textSearch(request, (results, status) => {
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && results) {
          const formattedResults: RestaurantResult[] = results.map((place) => ({
            place_id: place.place_id!,
            name: place.name!,
            formatted_address: place.formatted_address!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
              },
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
          }));
          resolve(formattedResults);
        } else {
          console.error('Places search failed:', status);
          resolve([]);
        }
      });
    });
  }, [placesService, userLocation, userCity]);

  // Get autocomplete predictions
  const getAutocompletePredictions = useCallback(async (input: string): Promise<google.maps.places.AutocompletePrediction[]> => {
    console.log('🔍 Getting autocomplete predictions for:', input);
    
    if (!autocompleteService || !input.trim()) {
      console.log('❌ Autocomplete service not available or empty input');
      return [];
    }

    return new Promise((resolve) => {
      const request: google.maps.places.AutocompletionRequest = {
        input: input,
        types: ['restaurant', 'food'],
      };

      console.log('📍 User Location:', userLocation);
      console.log('🏙️ User City:', userCity);

      // Add location bias if available
      if (userLocation) {
        request.location = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
        request.radius = 5000;
        console.log('✅ Using location bias for autocomplete');
      } else if (userCity) {
        // For city-based search, modify the input query to include the city
        request.input = `${input} ${userCity}`;
        console.log(`🏙️ No user location, searching for "${request.input}" in ${userCity}`);
      }

      console.log('📤 Sending autocomplete request:', request);

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        console.log('📥 Autocomplete response:', { status, predictionsCount: predictions?.length || 0 });
        
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
          console.log('✅ Autocomplete successful, got', predictions.length, 'predictions');
          resolve(predictions);
        } else {
          console.error('❌ Autocomplete failed:', status);
          resolve([]);
        }
      });
    });
  }, [autocompleteService, userLocation, userCity]);

  return {
    googleMapsLoaded,
    placesService,
    autocompleteService,
    loading,
    error,
    searchRestaurants,
    getAutocompletePredictions,
  };
};
