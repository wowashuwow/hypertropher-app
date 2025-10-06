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

export interface CityResult {
  place_id: string;
  name: string;
  formatted_address: string;
  city_country: string; // Format: "City Name, Country"
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
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

      // Always provide location for Google Places API
      if (userLocation) {
        request.location = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
        request.radius = 5000; // 5km
        console.log('🍽️ Using user location for restaurant search:', userLocation);
      } else if (userCity) {
        // Use a default location for the city (this is a fallback)
        // For now, use a default location that should work for most searches
        request.location = new window.google.maps.LatLng(19.0760, 72.8777); // Mumbai coordinates as fallback
        request.radius = 50000; // 50km for city-wide search
        request.query = `${query} ${userCity}`;
        console.log('🍽️ Using fallback location for restaurant search with city:', userCity);
      } else {
        // Last resort - use a global default location
        request.location = new window.google.maps.LatLng(19.0760, 72.8777); // Mumbai coordinates
        request.radius = 50000;
        console.log('🍽️ Using global fallback location for restaurant search');
      }

      placesService.textSearch(request, (results, status) => {
        console.log('🍽️ Google Places API response:', { status, resultsCount: results?.length || 0 });
        
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
          console.error('🍽️ Places search failed:', { 
            status, 
            errorMessage: status === 'ZERO_RESULTS' ? 'No restaurants found' : 
                         status === 'OVER_QUERY_LIMIT' ? 'API quota exceeded' :
                         status === 'REQUEST_DENIED' ? 'API request denied' :
                         status === 'INVALID_REQUEST' ? 'Invalid request parameters' :
                         `Unknown error: ${status}`
          });
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

  // Search cities using AutocompleteService
  const searchCities = useCallback(async (query: string): Promise<CityResult[]> => {
    console.log('🔍 Searching cities for:', query);
    
    if (!autocompleteService || !query.trim() || query.length < 2) {
      console.log('❌ Autocomplete service not available or query too short');
      return [];
    }

    return new Promise((resolve) => {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        types: ['(cities)'], // Restrict to cities only
      };

      console.log('📤 Sending city search request:', request);

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        console.log('📥 City search response:', { status, predictionsCount: predictions?.length || 0 });
        
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
          console.log('✅ City search successful, got', predictions.length, 'predictions');
          
          const cities: CityResult[] = predictions.map(prediction => {
            // Extract city and country from description
            const parts = prediction.description.split(', ');
            const cityName = parts[0];
            const country = parts[parts.length - 1]; // Last part is usually country
            const cityCountry = `${cityName}, ${country}`;
            
            return {
              place_id: prediction.place_id,
              name: cityName,
              formatted_address: prediction.description,
              city_country: cityCountry,
              geometry: {
                location: {
                  lat: 0, // Will be filled by getPlaceDetails if needed
                  lng: 0
                }
              }
            };
          });
          
          resolve(cities);
        } else {
          console.error('❌ City search failed:', status);
          resolve([]);
        }
      });
    });
  }, [autocompleteService]);

  return {
    googleMapsLoaded,
    placesService,
    autocompleteService,
    loading,
    error,
    searchRestaurants,
    getAutocompletePredictions,
    searchCities,
  };
};
