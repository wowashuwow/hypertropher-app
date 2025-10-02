// Google Maps Places API TypeScript definitions
declare global {
  interface Window {
    google?: typeof google;
  }
}

export interface GooglePlacesService {
  textSearch(request: {
    query?: string;
    location?: google.maps.LatLng | google.maps.LatLngLiteral;
    radius?: number;
    fields?: string[];
    region?: string;
  }): google.maps.places.PlaceResult[];

  getDetails(request: {
    placeId: string;
    fields?: string[];
  }): google.maps.places.PlaceResult | null;
}

export interface GooglePlacesAutocomplete {
  setFields(fields: string[]): void;
  setBounds(bounds: google.maps.LatLngBounds): void;
  setComponentRestrictions(restrictions: { country: string }): void;
  addListener(event: string, callback: () => void): void;
  getPlace(): google.maps.places.PlaceResult;
  getPlacePredictions(
    request: {
      input: string;
      location?: google.maps.LatLng | google.maps.LatLngLiteral;
      radius?: number;
    },
    callback: (predictions: google.maps.places.AutocompletePrediction[], status: google.maps.places.PlacesServiceStatus) => void
  ): void;
}

export interface RestaurantSearchResult {
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

export interface PlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  business_status?: string;
}
